// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StableFXAdapter
 * @notice Demo / adapter-mode USDC→EURC conversion for ArcMOQ hackathon settlement.
 * @dev Labeled "StableFX: Test or Adapter Mode". Not claiming production StableFX RFQ liquidity.
 *      Rate is expressed as EURC out per 1e6 USDC in, scaled by 1e6 (e.g. 920000 ≈ 0.92 EURC per USDC).
 */
contract StableFXAdapter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    IERC20 public immutable eurc;

    /// @notice EURC received per 1 USDC unit (both 6 decimals), scaled by 1e6.
    uint256 public rateE6;
    uint256 public feeBps;
    bool public paused;

    event QuoteExecuted(
        address indexed caller,
        uint256 usdcIn,
        uint256 eurcOut,
        uint256 feeEurc,
        uint256 rateE6
    );
    event LiquidityDeposited(address indexed token, uint256 amount);
    event RateUpdated(uint256 rateE6, uint256 feeBps);

    error Paused();
    error InvalidAmount();
    error InsufficientLiquidity();

    constructor(address usdc_, address eurc_, uint256 rateE6_, address owner_) Ownable(owner_) {
        require(usdc_ != address(0) && eurc_ != address(0), "zero token");
        require(rateE6_ > 0, "rate");
        usdc = IERC20(usdc_);
        eurc = IERC20(eurc_);
        rateE6 = rateE6_;
        feeBps = 15; // 0.15% demo FX fee
    }

    function setPaused(bool value) external onlyOwner {
        paused = value;
    }

    function setRate(uint256 rateE6_, uint256 feeBps_) external onlyOwner {
        require(rateE6_ > 0, "rate");
        require(feeBps_ <= 500, "fee");
        rateE6 = rateE6_;
        feeBps = feeBps_;
        emit RateUpdated(rateE6_, feeBps_);
    }

    function depositEURC(uint256 amount) external onlyOwner {
        eurc.safeTransferFrom(msg.sender, address(this), amount);
        emit LiquidityDeposited(address(eurc), amount);
    }

    function quoteEURCOut(uint256 usdcIn) public view returns (uint256 eurcOut, uint256 feeEurc) {
        uint256 gross = (usdcIn * rateE6) / 1e6;
        feeEurc = (gross * feeBps) / 10_000;
        eurcOut = gross - feeEurc;
    }

    /// @notice Pull USDC from caller and send EURC to `to`.
    function swapUsdcToEurc(uint256 usdcIn, address to)
        external
        nonReentrant
        returns (uint256 eurcOut, uint256 feeEurc)
    {
        if (paused) revert Paused();
        if (usdcIn == 0 || to == address(0)) revert InvalidAmount();

        (eurcOut, feeEurc) = quoteEURCOut(usdcIn);
        if (eurc.balanceOf(address(this)) < eurcOut) revert InsufficientLiquidity();

        usdc.safeTransferFrom(msg.sender, address(this), usdcIn);
        eurc.safeTransfer(to, eurcOut);

        emit QuoteExecuted(msg.sender, usdcIn, eurcOut, feeEurc, rateE6);
    }

    function rescue(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(to, amount);
    }
}
