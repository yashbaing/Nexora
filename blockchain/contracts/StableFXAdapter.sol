// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title StableFXAdapter
/// @notice Clearly labeled adapter/test mode for USDC → EURC conversion.
/// @dev Does NOT claim to convert AED. AED collection stays off-chain (simulated PSP).
///      On Arc Testnet this can be replaced with a StableFX sandbox settlement path.
contract StableFXAdapter is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    IERC20 public immutable eurc;

    /// @notice EURC out per 1e6 USDC in (1e6 = 1:1). Adapter/demo mode uses near-parity.
    uint256 public rateE6 = 1_000_000;
    uint256 public feeBps = 10; // 0.10%

    event QuoteTaken(address indexed payer, uint256 usdcIn, uint256 eurcOut, uint256 feeUSDC);
    event RateUpdated(uint256 rateE6, uint256 feeBps);
    event LiquiditySeeded(uint256 eurcAmount);

    constructor(address usdc_, address eurc_, address initialOwner) Ownable(initialOwner) {
        usdc = IERC20(usdc_);
        eurc = IERC20(eurc_);
    }

    function setRate(uint256 rateE6_, uint256 feeBps_) external onlyOwner {
        require(rateE6_ > 0 && feeBps_ < 10_000, "bad rate");
        rateE6 = rateE6_;
        feeBps = feeBps_;
        emit RateUpdated(rateE6_, feeBps_);
    }

    function seedEURC(uint256 amount) external {
        eurc.safeTransferFrom(msg.sender, address(this), amount);
        emit LiquiditySeeded(amount);
    }

    function quote(uint256 usdcIn) public view returns (uint256 eurcOut, uint256 feeUSDC) {
        feeUSDC = (usdcIn * feeBps) / 10_000;
        uint256 net = usdcIn - feeUSDC;
        eurcOut = (net * rateE6) / 1e6;
    }

    /// @notice Pull USDC from payer, pay EURC to recipient. Adapter Mode.
    function swapUSDCForEURC(address payer, address recipient, uint256 usdcIn)
        external
        returns (uint256 eurcOut, uint256 feeUSDC)
    {
        require(usdcIn > 0, "zero");
        (eurcOut, feeUSDC) = quote(usdcIn);
        require(eurc.balanceOf(address(this)) >= eurcOut, "insufficient EURC liquidity");
        usdc.safeTransferFrom(payer, address(this), usdcIn);
        eurc.safeTransfer(recipient, eurcOut);
        emit QuoteTaken(payer, usdcIn, eurcOut, feeUSDC);
    }
}
