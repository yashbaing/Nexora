// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IStableFXAdapter {
    function swapUSDCForEURC(address payer, address recipient, uint256 usdcIn)
        external
        returns (uint256 eurcOut, uint256 feeUSDC);

    function quote(uint256 usdcIn) external view returns (uint256 eurcOut, uint256 feeUSDC);
}

/// @title GroupOrder
/// @notice UAE SME group purchasing pool settled on Arc with USDC → EURC.
contract GroupOrder is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum OrderStatus {
        Open,
        Negotiating,
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
        bool funded;
        bool active;
        bool refunded;
        string businessName;
    }

    struct SupplierOffer {
        address supplier;
        string supplierId;
        uint256 quantity;
        uint256 unitPriceEURC; // 6 decimals (EURC)
        uint256 totalEURC;
        uint256 totalUSDCBudget; // max USDC agent may spend for FX
        uint256 expiry;
        bytes32 termsHash;
        bool accepted;
        bool exists;
    }

    IERC20 public immutable usdc;
    IERC20 public immutable eurc;
    IStableFXAdapter public fxAdapter;

    address public agent;
    mapping(address => bool) public whitelistedSuppliers;

    uint256 public nextOrderId = 1;

    struct Order {
        uint256 id;
        string productName;
        string origin;
        string packaging;
        uint256 targetQuantity;
        uint256 originalMOQ;
        uint256 totalDemand;
        uint256 totalFundedUSDC;
        OrderStatus status;
        uint256 createdAt;
        uint256 expiry;
        address acceptedSupplier;
        uint256 settledUSDC;
        uint256 settledEURC;
        bytes32 settlementTxMemo;
    }

    mapping(uint256 => Order) public orders;
    mapping(uint256 => BuyerMandate[]) public mandates;
    mapping(uint256 => mapping(address => uint256)) public mandateIndex; // 1-based
    mapping(uint256 => SupplierOffer) public offers;

    event OrderCreated(uint256 indexed orderId, string productName, uint256 originalMOQ);
    event MandateJoined(uint256 indexed orderId, address indexed buyer, uint256 quantity, uint256 maxUSDC);
    event MandateFunded(uint256 indexed orderId, address indexed buyer, uint256 amount);
    event SupplierOfferSubmitted(uint256 indexed orderId, string supplierId, uint256 quantity, uint256 totalEURC);
    event SupplierOfferAccepted(uint256 indexed orderId, address supplier, uint256 totalEURC);
    event SettlementExecuted(
        uint256 indexed orderId, address supplier, uint256 usdcSpent, uint256 eurcPaid, uint256 feeUSDC
    );
    event UnusedFundsReleased(uint256 indexed orderId, address indexed buyer, uint256 amount);
    event OrderRefunded(uint256 indexed orderId, address indexed buyer, uint256 amount);
    event AgentUpdated(address agent);
    event SupplierWhitelistUpdated(address supplier, bool allowed);

    modifier onlyAgent() {
        require(msg.sender == agent || msg.sender == owner(), "not agent");
        _;
    }

    constructor(address usdc_, address eurc_, address fxAdapter_, address agent_, address initialOwner)
        Ownable(initialOwner)
    {
        usdc = IERC20(usdc_);
        eurc = IERC20(eurc_);
        fxAdapter = IStableFXAdapter(fxAdapter_);
        agent = agent_;
    }

    function setAgent(address agent_) external onlyOwner {
        agent = agent_;
        emit AgentUpdated(agent_);
    }

    function setFxAdapter(address fxAdapter_) external onlyOwner {
        fxAdapter = IStableFXAdapter(fxAdapter_);
    }

    function setSupplierWhitelist(address supplier, bool allowed) external onlyOwner {
        whitelistedSuppliers[supplier] = allowed;
        emit SupplierWhitelistUpdated(supplier, allowed);
    }

    function createOrder(
        string calldata productName,
        string calldata origin,
        string calldata packaging,
        uint256 targetQuantity,
        uint256 originalMOQ,
        uint256 expiry
    ) external onlyAgent returns (uint256 orderId) {
        orderId = nextOrderId++;
        Order storage o = orders[orderId];
        o.id = orderId;
        o.productName = productName;
        o.origin = origin;
        o.packaging = packaging;
        o.targetQuantity = targetQuantity;
        o.originalMOQ = originalMOQ;
        o.status = OrderStatus.Open;
        o.createdAt = block.timestamp;
        o.expiry = expiry;
        emit OrderCreated(orderId, productName, originalMOQ);
    }

    function joinOrder(
        uint256 orderId,
        uint256 quantity,
        uint256 maxUSDC,
        uint256 deliveryDeadline,
        uint256 maxSlippageBps,
        string calldata businessName
    ) external {
        Order storage o = orders[orderId];
        require(o.id != 0, "no order");
        require(o.status == OrderStatus.Open, "not open");
        require(block.timestamp < o.expiry, "expired");
        require(quantity > 0 && maxUSDC > 0, "bad mandate");
        require(mandateIndex[orderId][msg.sender] == 0, "already joined");

        mandates[orderId].push(
            BuyerMandate({
                buyer: msg.sender,
                quantity: quantity,
                maxUSDC: maxUSDC,
                deliveryDeadline: deliveryDeadline,
                maxSlippageBps: maxSlippageBps,
                fundedUSDC: 0,
                funded: false,
                active: true,
                refunded: false,
                businessName: businessName
            })
        );
        mandateIndex[orderId][msg.sender] = mandates[orderId].length;
        o.totalDemand += quantity;
        emit MandateJoined(orderId, msg.sender, quantity, maxUSDC);
    }

    /// @notice Agent can register sandbox buyers for demo orchestration.
    function joinOrderFor(
        uint256 orderId,
        address buyer,
        uint256 quantity,
        uint256 maxUSDC,
        uint256 deliveryDeadline,
        uint256 maxSlippageBps,
        string calldata businessName
    ) external onlyAgent {
        Order storage o = orders[orderId];
        require(o.id != 0, "no order");
        require(o.status == OrderStatus.Open, "not open");
        require(mandateIndex[orderId][buyer] == 0, "already joined");

        mandates[orderId].push(
            BuyerMandate({
                buyer: buyer,
                quantity: quantity,
                maxUSDC: maxUSDC,
                deliveryDeadline: deliveryDeadline,
                maxSlippageBps: maxSlippageBps,
                fundedUSDC: 0,
                funded: false,
                active: true,
                refunded: false,
                businessName: businessName
            })
        );
        mandateIndex[orderId][buyer] = mandates[orderId].length;
        o.totalDemand += quantity;
        emit MandateJoined(orderId, buyer, quantity, maxUSDC);
    }

    function fundMandate(uint256 orderId, uint256 amount) external nonReentrant {
        _fund(orderId, msg.sender, amount);
    }

    function fundMandateFor(uint256 orderId, address buyer, uint256 amount) external onlyAgent nonReentrant {
        _fund(orderId, buyer, amount);
    }

    function _fund(uint256 orderId, address buyer, uint256 amount) internal {
        Order storage o = orders[orderId];
        require(o.status == OrderStatus.Open || o.status == OrderStatus.Negotiating, "bad status");
        uint256 idx = mandateIndex[orderId][buyer];
        require(idx > 0, "no mandate");
        BuyerMandate storage m = mandates[orderId][idx - 1];
        require(m.active && !m.refunded, "inactive");
        require(m.fundedUSDC + amount <= m.maxUSDC, "over budget");

        usdc.safeTransferFrom(msg.sender == agent ? msg.sender : buyer, address(this), amount);
        // When agent funds for buyer, agent is the token source
        if (msg.sender == agent && buyer != agent) {
            // already transferred from agent above when msg.sender==agent
        }

        m.fundedUSDC += amount;
        m.funded = true;
        o.totalFundedUSDC += amount;
        emit MandateFunded(orderId, buyer, amount);
    }

    function submitSupplierOffer(
        uint256 orderId,
        address supplier,
        string calldata supplierId,
        uint256 quantity,
        uint256 unitPriceEURC,
        uint256 totalUSDCBudget,
        uint256 expiry,
        bytes32 termsHash
    ) external onlyAgent {
        Order storage o = orders[orderId];
        require(o.id != 0, "no order");
        require(o.status == OrderStatus.Open || o.status == OrderStatus.Negotiating, "bad status");
        require(whitelistedSuppliers[supplier], "supplier not whitelisted");
        require(expiry > block.timestamp, "offer expired");
        require(quantity > 0 && unitPriceEURC > 0, "bad offer");

        uint256 totalEURC = quantity * unitPriceEURC;
        offers[orderId] = SupplierOffer({
            supplier: supplier,
            supplierId: supplierId,
            quantity: quantity,
            unitPriceEURC: unitPriceEURC,
            totalEURC: totalEURC,
            totalUSDCBudget: totalUSDCBudget,
            expiry: expiry,
            termsHash: termsHash,
            accepted: false,
            exists: true
        });
        o.status = OrderStatus.Negotiating;
        emit SupplierOfferSubmitted(orderId, supplierId, quantity, totalEURC);
    }

    /// @notice Deterministic policy gate before settlement.
    function policyCheck(uint256 orderId)
        public
        view
        returns (bool ok, string memory reason)
    {
        Order storage o = orders[orderId];
        if (o.id == 0) return (false, "no order");
        if (o.status != OrderStatus.Negotiating) return (false, "not negotiating");
        if (block.timestamp >= o.expiry) return (false, "order expired");

        SupplierOffer storage off = offers[orderId];
        if (!off.exists) return (false, "no offer");
        if (off.accepted) return (false, "already accepted");
        if (block.timestamp >= off.expiry) return (false, "offer expired");
        if (!whitelistedSuppliers[off.supplier]) return (false, "supplier not whitelisted");
        if (o.totalDemand < off.quantity) return (false, "demand below offer qty");
        if (o.totalFundedUSDC < off.totalUSDCBudget) return (false, "insufficient funding");

        BuyerMandate[] storage ms = mandates[orderId];
        uint256 allocated;
        for (uint256 i = 0; i < ms.length; i++) {
            BuyerMandate storage m = ms[i];
            if (!m.active) continue;
            if (!m.funded) return (false, "mandate unfunded");
            if (m.deliveryDeadline < block.timestamp + 1 days) return (false, "deadline too soon");
            // Pro-rata USDC share of offer budget
            uint256 share = (off.totalUSDCBudget * m.quantity) / o.totalDemand;
            if (share > m.maxUSDC || share > m.fundedUSDC) return (false, "buyer over mandate");
            allocated += share;
        }
        if (allocated > off.totalUSDCBudget + 1) return (false, "allocation mismatch");

        (uint256 eurcOut,) = fxAdapter.quote(off.totalUSDCBudget);
        if (eurcOut < off.totalEURC) return (false, "FX cannot cover EURC");

        return (true, "ok");
    }

    function acceptSupplierOffer(uint256 orderId) external onlyAgent {
        (bool ok, string memory reason) = policyCheck(orderId);
        require(ok, reason);
        offers[orderId].accepted = true;
        orders[orderId].acceptedSupplier = offers[orderId].supplier;
        emit SupplierOfferAccepted(orderId, offers[orderId].supplier, offers[orderId].totalEURC);
    }

    function executeSettlement(uint256 orderId) external onlyAgent nonReentrant {
        Order storage o = orders[orderId];
        SupplierOffer storage off = offers[orderId];
        require(off.accepted, "not accepted");
        (bool ok, string memory reason) = policyCheckAfterAccept(orderId);
        require(ok, reason);

        uint256 usdcSpend = off.totalUSDCBudget;
        usdc.forceApprove(address(fxAdapter), usdcSpend);
        (uint256 eurcPaid, uint256 feeUSDC) =
            fxAdapter.swapUSDCForEURC(address(this), off.supplier, usdcSpend);

        require(eurcPaid >= off.totalEURC, "underpaid supplier");

        o.status = OrderStatus.Settled;
        o.settledUSDC = usdcSpend;
        o.settledEURC = eurcPaid;
        o.settlementTxMemo = keccak256(abi.encode(orderId, off.supplier, usdcSpend, eurcPaid, block.timestamp));

        emit SettlementExecuted(orderId, off.supplier, usdcSpend, eurcPaid, feeUSDC);
    }

    function policyCheckAfterAccept(uint256 orderId) internal view returns (bool ok, string memory reason) {
        Order storage o = orders[orderId];
        if (o.status != OrderStatus.Negotiating) return (false, "bad status");
        SupplierOffer storage off = offers[orderId];
        if (!off.accepted) return (false, "not accepted");
        if (block.timestamp >= off.expiry) return (false, "offer expired");
        if (!whitelistedSuppliers[off.supplier]) return (false, "supplier not whitelisted");
        if (o.totalFundedUSDC < off.totalUSDCBudget) return (false, "insufficient funding");
        return (true, "ok");
    }

    function releaseUnusedFunds(uint256 orderId) external nonReentrant {
        Order storage o = orders[orderId];
        require(o.status == OrderStatus.Settled, "not settled");
        uint256 idx = mandateIndex[orderId][msg.sender];
        require(idx > 0, "no mandate");
        BuyerMandate storage m = mandates[orderId][idx - 1];
        require(m.active && !m.refunded, "inactive");

        uint256 share = (o.settledUSDC * m.quantity) / o.totalDemand;
        require(m.fundedUSDC >= share, "math");
        uint256 unused = m.fundedUSDC - share;
        m.refunded = true;
        if (unused > 0) {
            usdc.safeTransfer(m.buyer, unused);
        }
        emit UnusedFundsReleased(orderId, m.buyer, unused);
    }

    function releaseUnusedFundsFor(uint256 orderId, address buyer) external onlyAgent nonReentrant {
        Order storage o = orders[orderId];
        require(o.status == OrderStatus.Settled, "not settled");
        uint256 idx = mandateIndex[orderId][buyer];
        require(idx > 0, "no mandate");
        BuyerMandate storage m = mandates[orderId][idx - 1];
        require(!m.refunded, "done");
        uint256 share = (o.settledUSDC * m.quantity) / o.totalDemand;
        uint256 unused = m.fundedUSDC > share ? m.fundedUSDC - share : 0;
        m.refunded = true;
        if (unused > 0) {
            usdc.safeTransfer(m.buyer, unused);
        }
        emit UnusedFundsReleased(orderId, m.buyer, unused);
    }

    function refundExpiredOrder(uint256 orderId) external nonReentrant {
        Order storage o = orders[orderId];
        require(o.status == OrderStatus.Open || o.status == OrderStatus.Negotiating, "bad status");
        require(block.timestamp >= o.expiry, "not expired");
        o.status = OrderStatus.Expired;

        BuyerMandate[] storage ms = mandates[orderId];
        for (uint256 i = 0; i < ms.length; i++) {
            BuyerMandate storage m = ms[i];
            if (m.refunded || m.fundedUSDC == 0) continue;
            m.refunded = true;
            m.active = false;
            usdc.safeTransfer(m.buyer, m.fundedUSDC);
            emit OrderRefunded(orderId, m.buyer, m.fundedUSDC);
        }
    }

    function getMandates(uint256 orderId) external view returns (BuyerMandate[] memory) {
        return mandates[orderId];
    }

    function getOffer(uint256 orderId) external view returns (SupplierOffer memory) {
        return offers[orderId];
    }

    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }
}
