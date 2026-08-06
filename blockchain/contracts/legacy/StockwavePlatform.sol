// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TokenizedStock.sol";

contract StockwavePlatform is EIP712, Ownable {
    using ECDSA for bytes32;

    bytes32 private constant TRADE_QUOTE_TYPEHASH = keccak256(
        "TradeQuote(address user,string symbol,uint256 qty,uint256 price,uint256 deadline,uint256 nonce)"
    );

    address public immutable usdcToken;
    address public oracleSigner;

    // Mapping from symbol -> stock token contract address
    mapping(string => address) public stocks;
    // Mapping from user -> nonce
    mapping(address => uint256) public nonces;

    event StockBought(
        address indexed user,
        string symbol,
        uint256 qty,
        uint256 price,
        uint256 usdcSpent,
        uint256 timestamp
    );

    event StockSold(
        address indexed user,
        string symbol,
        uint256 qty,
        uint256 price,
        uint256 usdcReceived,
        uint256 timestamp
    );

    event StockRegistered(string symbol, address tokenAddress);
    event OracleSignerUpdated(address indexed newSigner);

    constructor(
        address _usdcToken,
        address _oracleSigner
    ) EIP712("StockwavePlatform", "1") Ownable(msg.sender) {
        require(_usdcToken != address(0), "USDC cannot be zero address");
        require(_oracleSigner != address(0), "Oracle cannot be zero address");
        usdcToken = _usdcToken;
        oracleSigner = _oracleSigner;
    }

    /**
     * @notice Set the backend oracle signer address
     * @param _oracleSigner New signer address
     */
    function setOracleSigner(address _oracleSigner) external onlyOwner {
        require(_oracleSigner != address(0), "Oracle cannot be zero address");
        oracleSigner = _oracleSigner;
        emit OracleSignerUpdated(_oracleSigner);
    }

    /**
     * @notice Register a new stock token or associate symbol with existing
     * @param symbol The stock symbol (e.g. "xAAPL")
     * @param tokenAddress The deployed TokenizedStock contract address
     */
    function registerStock(string calldata symbol, address tokenAddress) external onlyOwner {
        require(tokenAddress != address(0), "Token cannot be zero address");
        stocks[symbol] = tokenAddress;
        emit StockRegistered(symbol, tokenAddress);
    }

    /**
     * @notice Buy a tokenized stock using USDC
     * @param symbol The stock symbol
     * @param qty The quantity to buy (18 decimals)
     * @param price The price of stock in USDC (6 decimals, e.g. 180000000 for $180.00)
     * @param deadline Signature expiry timestamp
     * @param signature Cryptographic EIP-712 signature from backend oracle
     */
    function buyStock(
        string calldata symbol,
        uint256 qty,
        uint256 price,
        uint256 deadline,
        bytes calldata signature
    ) external {
        require(block.timestamp <= deadline, "Quote expired");
        
        bytes32 structHash = keccak256(
            abi.encode(
                TRADE_QUOTE_TYPEHASH,
                msg.sender,
                keccak256(bytes(symbol)),
                qty,
                price,
                deadline,
                nonces[msg.sender]++
            )
        );

        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = hash.recover(signature);
        require(signer == oracleSigner, "Invalid signature");

        address tokenAddress = stocks[symbol];
        require(tokenAddress != address(0), "Stock not registered");

        // qty has 18 decimals, price has 6 decimals
        // usdcSpent = qty * price / 10**18 (result has 6 decimals, matching USDC)
        uint256 usdcSpent = (qty * price) / 10**18;
        require(usdcSpent > 0, "Amount too small");

        bool success = IERC20(usdcToken).transferFrom(msg.sender, address(this), usdcSpent);
        require(success, "USDC transfer failed");

        TokenizedStock(tokenAddress).mint(msg.sender, qty);

        emit StockBought(msg.sender, symbol, qty, price, usdcSpent, block.timestamp);
    }

    /**
     * @notice Sell a tokenized stock and receive USDC
     * @param symbol The stock symbol
     * @param qty The quantity to sell (18 decimals)
     * @param price The price of stock in USDC (6 decimals)
     * @param deadline Signature expiry timestamp
     * @param signature Cryptographic EIP-712 signature from backend oracle
     */
    function sellStock(
        string calldata symbol,
        uint256 qty,
        uint256 price,
        uint256 deadline,
        bytes calldata signature
    ) external {
        require(block.timestamp <= deadline, "Quote expired");

        bytes32 structHash = keccak256(
            abi.encode(
                TRADE_QUOTE_TYPEHASH,
                msg.sender,
                keccak256(bytes(symbol)),
                qty,
                price,
                deadline,
                nonces[msg.sender]++
            )
        );

        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = hash.recover(signature);
        require(signer == oracleSigner, "Invalid signature");

        address tokenAddress = stocks[symbol];
        require(tokenAddress != address(0), "Stock not registered");

        // Burn stock tokens from user
        TokenizedStock(tokenAddress).burn(msg.sender, qty);

        // usdcReceived = qty * price / 10**18
        uint256 usdcReceived = (qty * price) / 10**18;
        require(usdcReceived > 0, "Amount too small");

        bool success = IERC20(usdcToken).transfer(msg.sender, usdcReceived);
        require(success, "USDC transfer failed");

        emit StockSold(msg.sender, symbol, qty, price, usdcReceived, block.timestamp);
    }
}
