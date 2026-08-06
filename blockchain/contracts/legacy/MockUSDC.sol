// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USD Coin", "USDC") {
        _mint(msg.sender, 1000000 * 10**6); // Mint 1M USDC to deployer
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    /**
     * @notice Mint tokens for testing
     * @param amount The amount to mint (including 6 decimals)
     */
    function faucet(uint256 amount) external {
        require(amount <= 100000 * 10**6, "Faucet limit exceeded (max 100k)");
        _mint(msg.sender, amount);
    }
}
