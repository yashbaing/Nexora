// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title WarehouseReceipt
/// @notice ERC-1155 digital warehouse receipts for verified physical inventory.
/// @dev Not a speculative asset. Units represent claims on a specific shipment batch.
contract WarehouseReceipt is ERC1155, Ownable, ReentrancyGuard {
    enum BatchStatus {
        None,
        PendingVerification,
        Verified,
        PartiallyRedeemed,
        FullyRedeemed,
        Paused
    }

    struct Batch {
        uint256 id;
        string batchCode;
        string productName;
        string origin;
        string packaging;
        string supplier;
        address custodian;
        uint256 totalQuantity;
        uint256 mintedQuantity;
        uint256 redeemedQuantity;
        BatchStatus status;
        bytes32 attestationHash;
        uint256 groupOrderId;
        bool paused;
    }

    struct Allocation {
        address buyer;
        uint256 quantity;
        uint256 redeemed;
        bool minted;
    }

    address public agent;
    address public attestationSigner;
    mapping(address => bool) public kybApproved;

    uint256 public nextBatchId = 1;
    mapping(uint256 => Batch) public batches;
    mapping(uint256 => Allocation[]) public allocations;
    mapping(uint256 => mapping(address => uint256)) public allocationIndex; // 1-based
    mapping(uint256 => mapping(address => bool)) public redemptionRequested;

    event BatchCreated(uint256 indexed batchId, string batchCode, uint256 groupOrderId, uint256 totalQuantity);
    event BatchVerified(uint256 indexed batchId, bytes32 attestationHash, address signer);
    event AllocationMinted(uint256 indexed batchId, address indexed buyer, uint256 quantity);
    event RedemptionRequested(uint256 indexed batchId, address indexed buyer, uint256 quantity);
    event RedemptionConfirmed(uint256 indexed batchId, address indexed buyer, uint256 quantity);
    event BatchPaused(uint256 indexed batchId, bool paused);
    event KYBUpdated(address indexed account, bool approved);

    modifier onlyAgent() {
        require(msg.sender == agent || msg.sender == owner(), "not agent");
        _;
    }

    constructor(address agent_, address attestationSigner_, address initialOwner)
        ERC1155("https://arcmoq.app/api/receipt/{id}.json")
        Ownable(initialOwner)
    {
        agent = agent_;
        attestationSigner = attestationSigner_;
    }

    function setAgent(address agent_) external onlyOwner {
        agent = agent_;
    }

    function setAttestationSigner(address signer_) external onlyOwner {
        attestationSigner = signer_;
    }

    function setKYB(address account, bool approved) external onlyAgent {
        kybApproved[account] = approved;
        emit KYBUpdated(account, approved);
    }

    function createBatch(
        string calldata batchCode,
        string calldata productName,
        string calldata origin,
        string calldata packaging,
        string calldata supplier,
        address custodian,
        uint256 totalQuantity,
        uint256 groupOrderId
    ) external onlyAgent returns (uint256 batchId) {
        require(totalQuantity > 0, "zero qty");
        batchId = nextBatchId++;
        batches[batchId] = Batch({
            id: batchId,
            batchCode: batchCode,
            productName: productName,
            origin: origin,
            packaging: packaging,
            supplier: supplier,
            custodian: custodian,
            totalQuantity: totalQuantity,
            mintedQuantity: 0,
            redeemedQuantity: 0,
            status: BatchStatus.PendingVerification,
            attestationHash: bytes32(0),
            groupOrderId: groupOrderId,
            paused: false
        });
        emit BatchCreated(batchId, batchCode, groupOrderId, totalQuantity);
    }

    /// @notice Trusted warehouse/custodian attestation — AI alone cannot mint.
    function verifyBatch(uint256 batchId, bytes32 attestationHash) external {
        Batch storage b = batches[batchId];
        require(b.status == BatchStatus.PendingVerification, "bad status");
        require(msg.sender == attestationSigner || msg.sender == b.custodian || msg.sender == owner(), "not verifier");
        require(attestationHash != bytes32(0), "empty attestation");
        b.attestationHash = attestationHash;
        b.status = BatchStatus.Verified;
        emit BatchVerified(batchId, attestationHash, msg.sender);
    }

    function registerAllocation(uint256 batchId, address buyer, uint256 quantity) external onlyAgent {
        Batch storage b = batches[batchId];
        require(b.id != 0, "no batch");
        require(allocationIndex[batchId][buyer] == 0, "exists");
        require(b.mintedQuantity + quantity <= b.totalQuantity, "over allocate");
        allocations[batchId].push(Allocation({buyer: buyer, quantity: quantity, redeemed: 0, minted: false}));
        allocationIndex[batchId][buyer] = allocations[batchId].length;
    }

    function mintAllocation(uint256 batchId, address buyer) external onlyAgent {
        Batch storage b = batches[batchId];
        require(b.status == BatchStatus.Verified, "not verified");
        require(!b.paused, "paused");
        require(kybApproved[buyer], "KYB required");
        uint256 idx = allocationIndex[batchId][buyer];
        require(idx > 0, "no allocation");
        Allocation storage a = allocations[batchId][idx - 1];
        require(!a.minted, "minted");
        a.minted = true;
        b.mintedQuantity += a.quantity;
        _mint(buyer, batchId, a.quantity, "");
        emit AllocationMinted(batchId, buyer, a.quantity);
    }

    function mintAllAllocations(uint256 batchId) external onlyAgent {
        Batch storage b = batches[batchId];
        require(b.status == BatchStatus.Verified, "not verified");
        require(!b.paused, "paused");
        Allocation[] storage allocs = allocations[batchId];
        for (uint256 i = 0; i < allocs.length; i++) {
            Allocation storage a = allocs[i];
            if (a.minted) continue;
            require(kybApproved[a.buyer], "KYB required");
            a.minted = true;
            b.mintedQuantity += a.quantity;
            _mint(a.buyer, batchId, a.quantity, "");
            emit AllocationMinted(batchId, a.buyer, a.quantity);
        }
    }

    function requestRedemption(uint256 batchId, uint256 quantity) external {
        Batch storage b = batches[batchId];
        require(!b.paused, "paused");
        require(b.status == BatchStatus.Verified || b.status == BatchStatus.PartiallyRedeemed, "bad status");
        require(balanceOf(msg.sender, batchId) >= quantity, "insufficient");
        redemptionRequested[batchId][msg.sender] = true;
        emit RedemptionRequested(batchId, msg.sender, quantity);
    }

    function confirmRedemption(uint256 batchId, address buyer, uint256 quantity) external nonReentrant {
        Batch storage b = batches[batchId];
        require(msg.sender == b.custodian || msg.sender == attestationSigner || msg.sender == owner(), "not warehouse");
        require(!b.paused, "paused");
        require(redemptionRequested[batchId][buyer], "not requested");
        require(balanceOf(buyer, batchId) >= quantity, "insufficient");

        uint256 idx = allocationIndex[batchId][buyer];
        require(idx > 0, "no allocation");
        Allocation storage a = allocations[batchId][idx - 1];
        a.redeemed += quantity;
        b.redeemedQuantity += quantity;
        redemptionRequested[batchId][buyer] = false;

        _burn(buyer, batchId, quantity);

        if (b.redeemedQuantity >= b.mintedQuantity) {
            b.status = BatchStatus.FullyRedeemed;
        } else {
            b.status = BatchStatus.PartiallyRedeemed;
        }

        emit RedemptionConfirmed(batchId, buyer, quantity);
    }

    function pauseBatch(uint256 batchId, bool paused) external onlyAgent {
        Batch storage b = batches[batchId];
        require(b.id != 0, "no batch");
        b.paused = paused;
        if (paused) b.status = BatchStatus.Paused;
        emit BatchPaused(batchId, paused);
    }

    function restrictedTransfer(address from, address to, uint256 batchId, uint256 amount) external {
        require(msg.sender == from || msg.sender == agent || msg.sender == owner(), "not allowed");
        require(kybApproved[to], "recipient not KYB");
        require(!batches[batchId].paused, "paused");
        _safeTransferFrom(from, to, batchId, amount, "");
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override
    {
        if (from != address(0) && to != address(0)) {
            // Transfers only between KYB-approved businesses
            require(kybApproved[from] && kybApproved[to], "KYB transfer only");
            for (uint256 i = 0; i < ids.length; i++) {
                require(!batches[ids[i]].paused, "batch paused");
            }
        }
        if (to != address(0) && from == address(0)) {
            // mint path — buyer must be KYB
            require(kybApproved[to], "KYB required");
        }
        super._update(from, to, ids, values);
    }

    function getBatch(uint256 batchId) external view returns (Batch memory) {
        return batches[batchId];
    }

    function getAllocations(uint256 batchId) external view returns (Allocation[] memory) {
        return allocations[batchId];
    }
}
