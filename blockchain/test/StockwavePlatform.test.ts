import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { MockUSDC, TokenizedStock, StockwavePlatform } from "../typechain-types";

describe("Stockwave Web3 Platform", function () {
  let mockUSDC: MockUSDC;
  let platform: StockwavePlatform;
  let appleStock: TokenizedStock;

  let owner: SignerWithAddress;
  let oracle: SignerWithAddress;
  let user: SignerWithAddress;

  const symbol = "xAAPL";
  const initialStockPrice = 180000000; // $180.00 (6 decimals)
  const buyQty = ethers.parseEther("2.5"); // 2.5 shares (18 decimals)
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour expiry

  beforeEach(async function () {
    [owner, oracle, user] = await ethers.getSigners();

    // 1. Deploy MockUSDC
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    mockUSDC = (await MockUSDCFactory.deploy()) as MockUSDC;
    await mockUSDC.waitForDeployment();

    // 2. Deploy StockwavePlatform
    const PlatformFactory = await ethers.getContractFactory("StockwavePlatform");
    platform = (await PlatformFactory.deploy(
      await mockUSDC.getAddress(),
      oracle.address
    )) as StockwavePlatform;
    await platform.waitForDeployment();

    // 3. Deploy Apple Stock Token with platform as owner
    const StockFactory = await ethers.getContractFactory("TokenizedStock");
    appleStock = (await StockFactory.deploy(
      "Tokenized Apple Inc.",
      symbol,
      await platform.getAddress()
    )) as TokenizedStock;
    await appleStock.waitForDeployment();

    // 4. Register stock
    await platform.registerStock(symbol, await appleStock.getAddress());

    // 5. Transfer some USDC to user from faucet and approve platform
    await mockUSDC.connect(user).faucet(10000 * 10**6); // $10,000 USDC
    await mockUSDC.connect(user).approve(await platform.getAddress(), ethers.MaxUint256);
  });

  async function getSignature(
    userAddr: string,
    stockSymbol: string,
    qty: bigint,
    price: number,
    expiry: number,
    nonce: number
  ): Promise<string> {
    const domain = {
      name: "StockwavePlatform",
      version: "1",
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: await platform.getAddress(),
    };

    const types = {
      TradeQuote: [
        { name: "user", type: "address" },
        { name: "symbol", type: "string" },
        { name: "qty", type: "uint256" },
        { name: "price", type: "uint256" },
        { name: "deadline", type: "uint256" },
        { name: "nonce", type: "uint256" },
      ],
    };

    const value = {
      user: userAddr,
      symbol: stockSymbol,
      qty: qty,
      price: price,
      deadline: expiry,
      nonce: nonce,
    };

    return await oracle.signTypedData(domain, types, value);
  }

  it("should deploy correctly and initialize state", async function () {
    expect(await platform.usdcToken()).to.equal(await mockUSDC.getAddress());
    expect(await platform.oracleSigner()).to.equal(oracle.address);
    expect(await platform.stocks(symbol)).to.equal(await appleStock.getAddress());
  });

  it("should allow a user to buy stock with a valid oracle signature", async function () {
    const nonce = await platform.nonces(user.address);
    const signature = await getSignature(
      user.address,
      symbol,
      buyQty,
      initialStockPrice,
      deadline,
      Number(nonce)
    );

    // Compute expected USDC cost: 2.5 * 180 = $450 USDC (450 * 10**6)
    const expectedUsdcSpent = (buyQty * BigInt(initialStockPrice)) / ethers.parseEther("1");
    expect(expectedUsdcSpent).to.equal(450 * 10**6);

    const userUsdcBefore = await mockUSDC.balanceOf(user.address);
    const platformUsdcBefore = await mockUSDC.balanceOf(await platform.getAddress());

    // Buy
    await expect(
      platform.connect(user).buyStock(symbol, buyQty, initialStockPrice, deadline, signature)
    )
      .to.emit(platform, "StockBought")
      .withArgs(user.address, symbol, buyQty, initialStockPrice, expectedUsdcSpent, anyValue => true);

    // Check balances
    expect(await mockUSDC.balanceOf(user.address)).to.equal(userUsdcBefore - expectedUsdcSpent);
    expect(await mockUSDC.balanceOf(await platform.getAddress())).to.equal(platformUsdcBefore + expectedUsdcSpent);
    expect(await appleStock.balanceOf(user.address)).to.equal(buyQty);
    expect(await platform.nonces(user.address)).to.equal(nonce + 1n);
  });

  it("should reject expired quotes", async function () {
    const expiredDeadline = Math.floor(Date.now() / 1000) - 60; // 1 min ago
    const nonce = await platform.nonces(user.address);
    const signature = await getSignature(
      user.address,
      symbol,
      buyQty,
      initialStockPrice,
      expiredDeadline,
      Number(nonce)
    );

    await expect(
      platform.connect(user).buyStock(symbol, buyQty, initialStockPrice, expiredDeadline, signature)
    ).to.be.revertedWith("Quote expired");
  });

  it("should reject invalid signatures", async function () {
    const nonce = await platform.nonces(user.address);
    // Sign with wrong signer (user signs instead of oracle)
    const wrongSignature = await user.signTypedData(
      {
        name: "StockwavePlatform",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await platform.getAddress(),
      },
      {
        TradeQuote: [
          { name: "user", type: "address" },
          { name: "symbol", type: "string" },
          { name: "qty", type: "uint256" },
          { name: "price", type: "uint256" },
          { name: "deadline", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      },
      {
        user: user.address,
        symbol: symbol,
        qty: buyQty,
        price: initialStockPrice,
        deadline: deadline,
        nonce: Number(nonce),
      }
    );

    await expect(
      platform.connect(user).buyStock(symbol, buyQty, initialStockPrice, deadline, wrongSignature)
    ).to.be.revertedWith("Invalid signature");
  });

  it("should allow a user to sell stock with a valid signature", async function () {
    // 1. Buy some stock first
    const buyNonce = await platform.nonces(user.address);
    const buySig = await getSignature(
      user.address,
      symbol,
      buyQty,
      initialStockPrice,
      deadline,
      Number(buyNonce)
    );
    await platform.connect(user).buyStock(symbol, buyQty, initialStockPrice, deadline, buySig);

    // 2. Sell the stock
    const sellNonce = await platform.nonces(user.address);
    const sellQty = ethers.parseEther("1.0"); // Sell 1 share
    const sellPrice = 190000000; // Price increased to $190.00
    const sellSig = await getSignature(
      user.address,
      symbol,
      sellQty,
      sellPrice,
      deadline,
      Number(sellNonce)
    );

    const expectedUsdcProceeds = (sellQty * BigInt(sellPrice)) / ethers.parseEther("1");
    expect(expectedUsdcProceeds).to.equal(190 * 10**6);

    const userUsdcBefore = await mockUSDC.balanceOf(user.address);
    const userStockBefore = await appleStock.balanceOf(user.address);

    await expect(
      platform.connect(user).sellStock(symbol, sellQty, sellPrice, deadline, sellSig)
    )
      .to.emit(platform, "StockSold")
      .withArgs(user.address, symbol, sellQty, sellPrice, expectedUsdcProceeds, anyValue => true);

    // Check balances
    expect(await mockUSDC.balanceOf(user.address)).to.equal(userUsdcBefore + expectedUsdcProceeds);
    expect(await appleStock.balanceOf(user.address)).to.equal(userStockBefore - sellQty);
  });
});
