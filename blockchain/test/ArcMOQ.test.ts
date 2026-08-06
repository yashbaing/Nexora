import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ArcMOQ GroupOrder + WarehouseReceipt", function () {
  async function deployFixture() {
    const [owner, agent, buyerA, buyerB, supplier, warehouse] = await ethers.getSigners();

    const Mock = await ethers.getContractFactory("MockERC20");
    const usdc = await Mock.deploy("USDC", "USDC", 6);
    const eurc = await Mock.deploy("EURC", "EURC", 6);

    const GroupOrder = await ethers.getContractFactory("GroupOrder");
    const groupOrder = await GroupOrder.deploy(
      await usdc.getAddress(),
      await eurc.getAddress(),
      agent.address,
      owner.address
    );

    const Adapter = await ethers.getContractFactory("StableFXAdapter");
    const adapter = await Adapter.deploy(
      await usdc.getAddress(),
      await eurc.getAddress(),
      920_000n,
      owner.address
    );

    const Receipt = await ethers.getContractFactory("WarehouseReceipt");
    const receipt = await Receipt.deploy(owner.address, warehouse.address);

    await groupOrder.setFxAdapter(await adapter.getAddress());
    await groupOrder.setWarehouseReceipt(await receipt.getAddress());
    await groupOrder.setSupplierWhitelist(supplier.address, true);
    await groupOrder.setSettlementWallet(supplier.address, true);

    const mint = ethers.parseUnits("100000", 6);
    for (const u of [owner, buyerA, buyerB, agent]) {
      await usdc.mint(u.address, mint);
      await eurc.mint(u.address, mint);
    }
    await eurc.connect(owner).approve(await adapter.getAddress(), mint);
    await adapter.depositEURC(mint);

    const expiry = (await time.latest()) + 86400 * 30;
    await groupOrder.createOrder(
      "EVOO-ES-UAE-001",
      "Extra Virgin Olive Oil",
      "Jaén, Spain",
      "5-liter tins",
      280,
      1000,
      expiry
    );

    return { owner, agent, buyerA, buyerB, supplier, warehouse, usdc, eurc, groupOrder, adapter, receipt };
  }

  it("funds mandates, negotiates MOQ, settles USDC→EURC, mints and redeems receipts", async function () {
    const { agent, buyerA, buyerB, supplier, warehouse, usdc, groupOrder, receipt, owner } =
      await deployFixture();

    const deadline = (await time.latest()) + 86400 * 60;
    await groupOrder.connect(buyerA).joinOrder(1, 100, ethers.parseUnits("5000", 6), deadline, 200);
    await groupOrder.connect(buyerB).joinOrder(1, 180, ethers.parseUnits("9000", 6), deadline, 200);

    await usdc.connect(buyerA).approve(await groupOrder.getAddress(), ethers.parseUnits("5000", 6));
    await usdc.connect(buyerB).approve(await groupOrder.getAddress(), ethers.parseUnits("9000", 6));
    await groupOrder.connect(buyerA).fundMandate(1, ethers.parseUnits("4500", 6));
    await groupOrder.connect(buyerB).fundMandate(1, ethers.parseUnits("8200", 6));

    const offerExpiry = (await time.latest()) + 300;
    const qty = 280n;
    // €38.10 per tin → 38.10 * 1e6 EURC base units per tin
    const unitPriceEurc = 38_100_000n;
    const totalEurcAmount = unitPriceEurc * qty;
    const termsHash = ethers.keccak256(ethers.toUtf8Bytes("oliva-sur-860"));
    await groupOrder
      .connect(agent)
      .submitSupplierOffer(
        1,
        supplier.address,
        supplier.address,
        280,
        totalEurcAmount,
        unitPriceEurc,
        offerExpiry,
        termsHash
      );

    await groupOrder.connect(agent).acceptSupplierOffer(1, 1);

    // Adapter rate 0.92 with 0.15% fee → need ~11,614 USDC for 10,668 EURC
    const usdcToSpend = ethers.parseUnits("11614", 6);
    await groupOrder.connect(agent).executeSettlement(1, usdcToSpend, totalEurcAmount);

    const order = await groupOrder.orders(1);
    expect(order.status).to.equal(3); // Settled

    await receipt.setKybApproved(buyerA.address, true);
    await receipt.setKybApproved(buyerB.address, true);
    await receipt.createBatch(
      "EVOO-ES-UAE-001",
      "Extra Virgin Olive Oil",
      "Jaén, Spain",
      "5-liter tins",
      supplier.address,
      warehouse.address,
      280
    );

    const attestation = ethers.keccak256(ethers.toUtf8Bytes("bol+packing+invoice"));
    await receipt.connect(warehouse).verifyBatch(1, attestation, "BL-ES-UAE-77821");
    await receipt.mintAllocations(1, [buyerA.address, buyerB.address], [100, 180]);

    expect(await receipt.balanceOf(buyerA.address, 1)).to.equal(100);
    expect(await receipt.balanceOf(buyerB.address, 1)).to.equal(180);

    await receipt.connect(buyerA).requestRedemption(1, 100);
    await receipt.connect(warehouse).confirmRedemption(1, buyerA.address, 100);
    expect(await receipt.balanceOf(buyerA.address, 1)).to.equal(0);
  });

  it("blocks settlement when supplier is not whitelisted", async function () {
    const { agent, buyerA, usdc, groupOrder, owner } = await deployFixture();
    const deadline = (await time.latest()) + 86400 * 60;
    await groupOrder.connect(buyerA).joinOrder(1, 100, ethers.parseUnits("4500", 6), deadline, 200);
    await usdc.connect(buyerA).approve(await groupOrder.getAddress(), ethers.parseUnits("4500", 6));
    await groupOrder.connect(buyerA).fundMandate(1, ethers.parseUnits("4000", 6));

    const stranger = (await ethers.getSigners())[6];
    await expect(
      groupOrder
        .connect(agent)
        .submitSupplierOffer(
          1,
          stranger.address,
          stranger.address,
          100,
          1,
          1,
          (await time.latest()) + 100,
          ethers.id("x")
        )
    ).to.be.revertedWithCustomError(groupOrder, "NotWhitelisted");
  });
});
