// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title WarehouseReceipt
 * @notice ERC-1155 digital warehouse receipts for verified physical inventory batches.
 * @dev Units within a batch are fungible. Transfers restricted to KYB-approved addresses.
 *      AI may extract document fields but minting requires a trusted attestation signer.
 */
contract WarehouseReceipt is ERC1155, Ownable, Pausable, ReentrancyGuard {
    struct Batch {
        string batchId;
        string productName;
        string origin;
        string packaging;
        address supplier;
        address warehouse;
        uint256 totalQuantity;
        uint256 mintedQuantity;
        uint256 redeemedQuantity;
        bool verified;
        bool pausedBatch;
        bytes32 attestationHash;
        string shipmentRef;
        bool exists;
    }

    struct Allocation {
        address buyer;
        uint256 quantity;
        bool minted;
        uint256 redeemed;
    }

    uint256 public nextTokenId = 1;
    address public attestationSigner;
    address public groupOrder;

    mapping(uint256 => Batch) public batches;
    mapping(string => uint256) public batchIdToTokenId;
    mapping(uint256 => mapping(address => Allocation)) public allocations;
    mapping(uint256 => address[]) public batchBuyers;
    mapping(address => bool) public kybApproved;

    event BatchCreated(uint256 indexed tokenId, string batchId, uint256 totalQuantity, address warehouse);
    event BatchVerified(uint256 indexed tokenId, bytes32 attestationHash, string shipmentRef);
    event AllocationMinted(uint256 indexed tokenId, address indexed buyer, uint256 quantity);
    event RedemptionRequested(uint256 indexed tokenId, address indexed buyer, uint256 quantity);
    event RedemptionConfirmed(uint256 indexed tokenId, address indexed buyer, uint256 quantity);
    event BatchPaused(uint256 indexed tokenId, bool paused);

    error NotApproved();
    error NotVerified();
    error InvalidBatch();
    error AlreadyMinted();
    error InsufficientBalance();
    error TransferRestricted();

    constructor(address owner_, address attestationSigner_)
        ERC1155("https://arcmoq.app/api/receipt/{id}.json")
        Ownable(owner_)
    {
        attestationSigner = attestationSigner_;
    }

    function setGroupOrder(address groupOrder_) external onlyOwner {
        groupOrder = groupOrder_;
    }

    function setAttestationSigner(address signer_) external onlyOwner {
        attestationSigner = signer_;
    }

    function setKybApproved(address account, bool approved) external onlyOwner {
        kybApproved[account] = approved;
    }

    function setKybApprovedBatch(address[] calldata accounts, bool approved) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            kybApproved[accounts[i]] = approved;
        }
    }

    function createBatch(
        string calldata batchId,
        string calldata productName,
        string calldata origin,
        string calldata packaging,
        address supplier,
        address warehouse,
        uint256 totalQuantity
    ) external onlyOwner returns (uint256 tokenId) {
        require(bytes(batchId).length > 0, "batchId");
        require(batchIdToTokenId[batchId] == 0, "exists");
        require(totalQuantity > 0, "qty");

        tokenId = nextTokenId++;
        Batch storage b = batches[tokenId];
        b.batchId = batchId;
        b.productName = productName;
        b.origin = origin;
        b.packaging = packaging;
        b.supplier = supplier;
        b.warehouse = warehouse;
        b.totalQuantity = totalQuantity;
        b.exists = true;
        batchIdToTokenId[batchId] = tokenId;

        emit BatchCreated(tokenId, batchId, totalQuantity, warehouse);
    }

    /// @notice Trusted warehouse / custodian / demo verifier attestation — not LLM-only.
    function verifyBatch(
        uint256 tokenId,
        bytes32 attestationHash,
        string calldata shipmentRef
    ) external {
        Batch storage b = batches[tokenId];
        if (!b.exists) revert InvalidBatch();
        require(msg.sender == attestationSigner || msg.sender == owner() || msg.sender == b.warehouse, "signer");
        b.verified = true;
        b.attestationHash = attestationHash;
        b.shipmentRef = shipmentRef;
        emit BatchVerified(tokenId, attestationHash, shipmentRef);
    }

    function mintAllocation(uint256 tokenId, address buyer, uint256 quantity) public onlyOwner whenNotPaused {
        Batch storage b = batches[tokenId];
        if (!b.exists) revert InvalidBatch();
        if (!b.verified) revert NotVerified();
        if (b.pausedBatch) revert TransferRestricted();
        if (!kybApproved[buyer]) revert NotApproved();
        if (quantity == 0) revert InvalidBatch();
        if (b.mintedQuantity + quantity > b.totalQuantity) revert InvalidBatch();

        Allocation storage a = allocations[tokenId][buyer];
        if (!a.minted) {
            batchBuyers[tokenId].push(buyer);
            a.buyer = buyer;
            a.minted = true;
        }
        a.quantity += quantity;
        b.mintedQuantity += quantity;
        _mint(buyer, tokenId, quantity, "");
        emit AllocationMinted(tokenId, buyer, quantity);
    }

    function mintAllocations(
        uint256 tokenId,
        address[] calldata buyers,
        uint256[] calldata quantities
    ) external onlyOwner {
        require(buyers.length == quantities.length, "length");
        for (uint256 i = 0; i < buyers.length; i++) {
            mintAllocation(tokenId, buyers[i], quantities[i]);
        }
    }

    function requestRedemption(uint256 tokenId, uint256 quantity) external whenNotPaused {
        Batch storage b = batches[tokenId];
        if (!b.exists || !b.verified || b.pausedBatch) revert InvalidBatch();
        if (balanceOf(msg.sender, tokenId) < quantity) revert InsufficientBalance();
        emit RedemptionRequested(tokenId, msg.sender, quantity);
    }

    /// @notice Warehouse confirms physical release; burns receipt units.
    function confirmRedemption(uint256 tokenId, address buyer, uint256 quantity)
        external
        nonReentrant
        whenNotPaused
    {
        Batch storage b = batches[tokenId];
        if (!b.exists) revert InvalidBatch();
        require(msg.sender == b.warehouse || msg.sender == owner() || msg.sender == attestationSigner, "warehouse");
        if (balanceOf(buyer, tokenId) < quantity) revert InsufficientBalance();

        Allocation storage a = allocations[tokenId][buyer];
        a.redeemed += quantity;
        b.redeemedQuantity += quantity;
        _burn(buyer, tokenId, quantity);
        emit RedemptionConfirmed(tokenId, buyer, quantity);
    }

    /// @notice Owner/warehouse helper to burn after physical release is already confirmed offchain.
    function burnReceipt(uint256 tokenId, address buyer, uint256 quantity) external {
        require(msg.sender == owner() || msg.sender == batches[tokenId].warehouse || msg.sender == attestationSigner, "auth");
        if (balanceOf(buyer, tokenId) < quantity) revert InsufficientBalance();
        Allocation storage a = allocations[tokenId][buyer];
        a.redeemed += quantity;
        batches[tokenId].redeemedQuantity += quantity;
        _burn(buyer, tokenId, quantity);
        emit RedemptionConfirmed(tokenId, buyer, quantity);
    }

    function pauseBatch(uint256 tokenId, bool paused_) external onlyOwner {
        Batch storage b = batches[tokenId];
        if (!b.exists) revert InvalidBatch();
        b.pausedBatch = paused_;
        emit BatchPaused(tokenId, paused_);
    }

    function restrictedTransfer(address from, address to, uint256 tokenId, uint256 amount) external {
        require(msg.sender == from || msg.sender == owner(), "auth");
        if (!kybApproved[from] || !kybApproved[to]) revert TransferRestricted();
        Batch storage b = batches[tokenId];
        if (b.pausedBatch) revert TransferRestricted();
        _safeTransferFrom(from, to, tokenId, amount, "");
    }

    function getBatchBuyers(uint256 tokenId) external view returns (address[] memory) {
        return batchBuyers[tokenId];
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override
        whenNotPaused
    {
        // Mint (from=0) and burn (to=0) allowed; peer transfers require KYB on both sides.
        if (from != address(0) && to != address(0)) {
            if (!kybApproved[from] || !kybApproved[to]) revert TransferRestricted();
            for (uint256 i = 0; i < ids.length; i++) {
                if (batches[ids[i]].pausedBatch) revert TransferRestricted();
            }
        }
        super._update(from, to, ids, values);
    }
}
