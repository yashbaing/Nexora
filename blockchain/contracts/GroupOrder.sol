// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GroupOrder
 * @notice Pools UAE SME buyer mandates in USDC and settles the winning supplier offer in EURC.
 */
contract GroupOrder is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum OrderStatus {
        Open,
        Funded,
        OfferAccepted,
        Settled,
        Cancelled,
        Expired
    }

    struct BuyerMandate {
        address buyer;
        uint256 quantity;
        uint256 maxUSDC;
        uint256 deliveryDeadline;
        uint256 maxSlippageBps;
        uint256 fundedUSDC;
        uint256 allocatedUSDC;
        bool funded;
        bool active;
        bool refunded;
    }

    struct SupplierOffer {
        address supplier;
        address settlementWallet;
        uint256 quantity;
        uint256 totalEURC;
        uint256 unitPriceE6; // EUR cents-scale: EUR * 1e6 per tin
        uint256 expiry;
        bytes32 termsHash;
        bool accepted;
        bool exists;
    }

    IERC20 public immutable usdc;
    IERC20 public immutable eurc;
    address public agent;
    address public fxAdapter;
    address public warehouseReceipt;

    uint256 public nextOrderId = 1;
    uint256 public nextOfferId = 1;

    mapping(uint256 => OrderMeta) public orders;
    mapping(uint256 => mapping(address => BuyerMandate)) public mandates;
    mapping(uint256 => address[]) public orderBuyers;
    mapping(uint256 => mapping(uint256 => SupplierOffer)) public offers;
    mapping(address => bool) public whitelistedSuppliers;
    mapping(address => bool) public approvedSettlementWallets;

    struct OrderMeta {
        string productId;
        string productName;
        string origin;
        string packaging;
        uint256 targetQuantity;
        uint256 originalMOQ;
        uint256 totalDemand;
        uint256 totalFundedUSDC;
        uint256 acceptedOfferId;
        uint256 expiry;
        OrderStatus status;
        bool exists;
    }

    event OrderCreated(uint256 indexed orderId, string productId, uint256 targetQuantity, uint256 originalMOQ);
    event MandateJoined(uint256 indexed orderId, address indexed buyer, uint256 quantity, uint256 maxUSDC);
    event MandateFunded(uint256 indexed orderId, address indexed buyer, uint256 amount);
    event SupplierOfferSubmitted(uint256 indexed orderId, uint256 indexed offerId, address supplier, uint256 quantity, uint256 totalEURC);
    event SupplierOfferAccepted(uint256 indexed orderId, uint256 indexed offerId);
    event SettlementExecuted(
        uint256 indexed orderId,
        uint256 indexed offerId,
        uint256 usdcSpent,
        uint256 eurcPaid,
        address supplierWallet,
        bytes32 fxRef
    );
    event UnusedFundsReleased(uint256 indexed orderId, address indexed buyer, uint256 amount);
    event OrderRefunded(uint256 indexed orderId, address indexed buyer, uint256 amount);
    event AgentUpdated(address agent);
    event FxAdapterUpdated(address adapter);

    error NotAgent();
    error InvalidOrder();
    error InvalidMandate();
    error NotWhitelisted();
    error OfferExpired();
    error PolicyFailed(string reason);
    error BadStatus();

    modifier onlyAgent() {
        if (msg.sender != agent && msg.sender != owner()) revert NotAgent();
        _;
    }

    constructor(address usdc_, address eurc_, address agent_, address owner_) Ownable(owner_) {
        require(usdc_ != address(0) && eurc_ != address(0), "tokens");
        usdc = IERC20(usdc_);
        eurc = IERC20(eurc_);
        agent = agent_;
    }

    function setAgent(address agent_) external onlyOwner {
        agent = agent_;
        emit AgentUpdated(agent_);
    }

    function setFxAdapter(address adapter_) external onlyOwner {
        fxAdapter = adapter_;
        emit FxAdapterUpdated(adapter_);
    }

    function setWarehouseReceipt(address receipt_) external onlyOwner {
        warehouseReceipt = receipt_;
    }

    function setSupplierWhitelist(address supplier, bool allowed) external onlyOwner {
        whitelistedSuppliers[supplier] = allowed;
    }

    function setSettlementWallet(address wallet, bool allowed) external onlyOwner {
        approvedSettlementWallets[wallet] = allowed;
    }

    function createOrder(
        string calldata productId,
        string calldata productName,
        string calldata origin,
        string calldata packaging,
        uint256 targetQuantity,
        uint256 originalMOQ,
        uint256 expiry
    ) external onlyOwner returns (uint256 orderId) {
        orderId = nextOrderId++;
        OrderMeta storage o = orders[orderId];
        o.productId = productId;
        o.productName = productName;
        o.origin = origin;
        o.packaging = packaging;
        o.targetQuantity = targetQuantity;
        o.originalMOQ = originalMOQ;
        o.expiry = expiry;
        o.status = OrderStatus.Open;
        o.exists = true;
        emit OrderCreated(orderId, productId, targetQuantity, originalMOQ);
    }

    function joinOrder(
        uint256 orderId,
        uint256 quantity,
        uint256 maxUSDC,
        uint256 deliveryDeadline,
        uint256 maxSlippageBps
    ) external {
        OrderMeta storage o = orders[orderId];
        if (!o.exists) revert InvalidOrder();
        if (o.status != OrderStatus.Open && o.status != OrderStatus.Funded) revert BadStatus();
        if (quantity == 0 || maxUSDC == 0) revert InvalidMandate();

        BuyerMandate storage m = mandates[orderId][msg.sender];
        if (m.active) {
            o.totalDemand -= m.quantity;
        } else {
            orderBuyers[orderId].push(msg.sender);
        }

        m.buyer = msg.sender;
        m.quantity = quantity;
        m.maxUSDC = maxUSDC;
        m.deliveryDeadline = deliveryDeadline;
        m.maxSlippageBps = maxSlippageBps;
        m.active = true;
        m.refunded = false;

        o.totalDemand += quantity;
        emit MandateJoined(orderId, msg.sender, quantity, maxUSDC);
    }

    function fundMandate(uint256 orderId, uint256 amount) external nonReentrant {
        OrderMeta storage o = orders[orderId];
        BuyerMandate storage m = mandates[orderId][msg.sender];
        if (!o.exists || !m.active) revert InvalidMandate();
        if (o.status != OrderStatus.Open && o.status != OrderStatus.Funded) revert BadStatus();
        if (amount == 0) revert InvalidMandate();
        if (m.fundedUSDC + amount > m.maxUSDC) revert PolicyFailed("over maxUSDC");

        usdc.safeTransferFrom(msg.sender, address(this), amount);
        m.fundedUSDC += amount;
        m.funded = true;
        o.totalFundedUSDC += amount;

        if (o.totalDemand >= o.targetQuantity && _allActiveFunded(orderId)) {
            o.status = OrderStatus.Funded;
        }

        emit MandateFunded(orderId, msg.sender, amount);
    }

    function submitSupplierOffer(
        uint256 orderId,
        address supplier,
        address settlementWallet,
        uint256 quantity,
        uint256 totalEURC,
        uint256 unitPriceE6,
        uint256 expiry,
        bytes32 termsHash
    ) external onlyAgent returns (uint256 offerId) {
        OrderMeta storage o = orders[orderId];
        if (!o.exists) revert InvalidOrder();
        if (!whitelistedSuppliers[supplier]) revert NotWhitelisted();
        if (!approvedSettlementWallets[settlementWallet]) revert PolicyFailed("wallet");
        if (expiry <= block.timestamp) revert OfferExpired();

        offerId = nextOfferId++;
        SupplierOffer storage offer = offers[orderId][offerId];
        offer.supplier = supplier;
        offer.settlementWallet = settlementWallet;
        offer.quantity = quantity;
        offer.totalEURC = totalEURC;
        offer.unitPriceE6 = unitPriceE6;
        offer.expiry = expiry;
        offer.termsHash = termsHash;
        offer.exists = true;

        emit SupplierOfferSubmitted(orderId, offerId, supplier, quantity, totalEURC);
    }

    function acceptSupplierOffer(uint256 orderId, uint256 offerId) external onlyAgent {
        OrderMeta storage o = orders[orderId];
        SupplierOffer storage offer = offers[orderId][offerId];
        if (!o.exists || !offer.exists) revert InvalidOrder();
        if (offer.expiry <= block.timestamp) revert OfferExpired();
        if (!whitelistedSuppliers[offer.supplier]) revert NotWhitelisted();
        if (o.status != OrderStatus.Open && o.status != OrderStatus.Funded && o.status != OrderStatus.OfferAccepted) {
            revert BadStatus();
        }

        offer.accepted = true;
        o.acceptedOfferId = offerId;
        o.status = OrderStatus.OfferAccepted;
        emit SupplierOfferAccepted(orderId, offerId);
    }

    /**
     * @notice Policy-gated settlement: allocate USDC pro-rata, swap via adapter, pay supplier EURC.
     * @param usdcToSpend Exact USDC the policy engine approved for FX + settlement.
     * @param minEurcOut Slippage floor enforced against buyer maxSlippage policy offchain + here.
     */
    function executeSettlement(uint256 orderId, uint256 usdcToSpend, uint256 minEurcOut)
        external
        onlyAgent
        nonReentrant
        returns (uint256 eurcPaid)
    {
        OrderMeta storage o = orders[orderId];
        if (!o.exists) revert InvalidOrder();
        if (o.status != OrderStatus.OfferAccepted && o.status != OrderStatus.Funded) revert BadStatus();
        if (fxAdapter == address(0)) revert PolicyFailed("no fx");

        uint256 offerId = o.acceptedOfferId;
        SupplierOffer storage offer = offers[orderId][offerId];
        if (!offer.accepted) revert PolicyFailed("offer");
        if (offer.expiry <= block.timestamp) revert OfferExpired();
        if (!whitelistedSuppliers[offer.supplier]) revert NotWhitelisted();
        if (!approvedSettlementWallets[offer.settlementWallet]) revert PolicyFailed("wallet");
        if (o.totalFundedUSDC < usdcToSpend) revert PolicyFailed("underfunded");
        if (o.totalDemand < offer.quantity) revert PolicyFailed("demand");

        // Allocate USDC spend across buyers proportional to quantity.
        address[] storage buyers = orderBuyers[orderId];
        uint256 allocated;
        for (uint256 i = 0; i < buyers.length; i++) {
            BuyerMandate storage m = mandates[orderId][buyers[i]];
            if (!m.active || !m.funded) continue;
            if (m.deliveryDeadline < block.timestamp) revert PolicyFailed("deadline");
            uint256 share = (usdcToSpend * m.quantity) / o.totalDemand;
            m.allocatedUSDC = share;
            allocated += share;
            if (share > m.fundedUSDC) revert PolicyFailed("buyer budget");
        }
        // Dust from integer division assigned to first active funded buyer.
        if (allocated < usdcToSpend) {
            uint256 dust = usdcToSpend - allocated;
            for (uint256 i = 0; i < buyers.length; i++) {
                BuyerMandate storage m = mandates[orderId][buyers[i]];
                if (!m.active || !m.funded) continue;
                if (m.allocatedUSDC + dust > m.fundedUSDC) revert PolicyFailed("buyer budget");
                m.allocatedUSDC += dust;
                break;
            }
        }

        usdc.forceApprove(fxAdapter, usdcToSpend);
        (bool ok, bytes memory data) = fxAdapter.call(
            abi.encodeWithSignature("swapUsdcToEurc(uint256,address)", usdcToSpend, offer.settlementWallet)
        );
        if (!ok) revert PolicyFailed("fx failed");
        (uint256 eurcOut,) = abi.decode(data, (uint256, uint256));
        if (eurcOut < minEurcOut) revert PolicyFailed("slippage");
        if (eurcOut < offer.totalEURC) revert PolicyFailed("eurc short");

        o.status = OrderStatus.Settled;
        o.totalFundedUSDC -= usdcToSpend;
        eurcPaid = eurcOut;

        emit SettlementExecuted(
            orderId,
            offerId,
            usdcToSpend,
            eurcOut,
            offer.settlementWallet,
            keccak256(abi.encode(orderId, offerId, usdcToSpend, eurcOut, block.timestamp))
        );
    }

    function releaseUnusedFunds(uint256 orderId) external nonReentrant {
        OrderMeta storage o = orders[orderId];
        if (o.status != OrderStatus.Settled) revert BadStatus();
        BuyerMandate storage m = mandates[orderId][msg.sender];
        if (!m.active || m.refunded) revert InvalidMandate();
        uint256 unused = m.fundedUSDC - m.allocatedUSDC;
        m.fundedUSDC = m.allocatedUSDC;
        if (unused > 0) {
            o.totalFundedUSDC -= unused;
            usdc.safeTransfer(msg.sender, unused);
            emit UnusedFundsReleased(orderId, msg.sender, unused);
        }
    }

    function refundExpiredOrder(uint256 orderId) external nonReentrant {
        OrderMeta storage o = orders[orderId];
        if (!o.exists) revert InvalidOrder();
        if (o.status == OrderStatus.Settled) revert BadStatus();
        if (block.timestamp < o.expiry && o.status != OrderStatus.Cancelled) revert PolicyFailed("not expired");

        BuyerMandate storage m = mandates[orderId][msg.sender];
        if (!m.active || m.refunded || m.fundedUSDC == 0) revert InvalidMandate();

        uint256 amount = m.fundedUSDC;
        m.fundedUSDC = 0;
        m.refunded = true;
        m.active = false;
        o.totalFundedUSDC -= amount;
        o.status = OrderStatus.Expired;
        usdc.safeTransfer(msg.sender, amount);
        emit OrderRefunded(orderId, msg.sender, amount);
    }

    function cancelMandate(uint256 orderId) external nonReentrant {
        OrderMeta storage o = orders[orderId];
        BuyerMandate storage m = mandates[orderId][msg.sender];
        if (!o.exists || !m.active) revert InvalidMandate();
        if (o.status != OrderStatus.Open) revert BadStatus();

        if (m.fundedUSDC > 0) {
            uint256 amount = m.fundedUSDC;
            m.fundedUSDC = 0;
            o.totalFundedUSDC -= amount;
            usdc.safeTransfer(msg.sender, amount);
            emit OrderRefunded(orderId, msg.sender, amount);
        }

        o.totalDemand -= m.quantity;
        m.active = false;
        m.quantity = 0;
    }

    function getBuyers(uint256 orderId) external view returns (address[] memory) {
        return orderBuyers[orderId];
    }

    function getMandate(uint256 orderId, address buyer) external view returns (BuyerMandate memory) {
        return mandates[orderId][buyer];
    }

    function getOffer(uint256 orderId, uint256 offerId) external view returns (SupplierOffer memory) {
        return offers[orderId][offerId];
    }

    function _allActiveFunded(uint256 orderId) internal view returns (bool) {
        address[] storage buyers = orderBuyers[orderId];
        for (uint256 i = 0; i < buyers.length; i++) {
            BuyerMandate storage m = mandates[orderId][buyers[i]];
            if (m.active && (!m.funded || m.fundedUSDC == 0)) return false;
        }
        return buyers.length > 0;
    }
}
