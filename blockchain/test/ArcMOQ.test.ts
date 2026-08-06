import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ArcMOQ GroupOrder + WarehouseReceipt", function () {
  async function deployFixture() {
    const [agent, supplier, buyerA, buyerB, custodian] = await ethers.getSigners();

    const Mock = await ethers.getContractFactory("MockERC20");
    const usdc = await Mock.deploy("USDC", "USDC", 6);
    const eurc = await Mock.deploy("EURC", "EURC", 6);
    await usdc.waitForDeployment();
    await eurc.waitForDeployment();

    const Adapter = await ethers.getContractFactory("StableFXAdapter");
    const adapter = await Adapter.deploy(await usdc.getAddress(), await eurc.getAddress(), agent.address);
    await adapter.waitForDeployment();

    await usdc.faucet(agent.address, ethers.parseUnits("1000000", 6));
    await eurc.faucet(agent.address, ethers.parseUnits("1000000", 6));
    await eurc.approve(await adapter.getAddress(), ethers.parseUnits("500000", 6));
    await adapter.seedEURC(ethers.parseUnits("500000", 6));

    const Group = await ethers.getContractFactory("GroupOrder");
    const group = await Group.deploy(
      await usdc.getAddress(),
      await eurc.getAddress(),
      await adapter.getAddress(),
      agent.address,
      agent.address
    );
    await group.waitForDeployment();
    await group.setSupplierWhitelist(supplier.address, true);

    const Receipt = await ethers.getContractFactory("WarehouseReceipt");
    const receipt = await Receipt.deploy(agent.address, custodian.address, agent.address);
    await receipt.waitForDeployment();

    return { agent, supplier, buyerA, buyerB, custodian, usdc, eurc, adapter, group, receipt };
  }

  it("runs full olive oil group buy → settle → mint → redeem", async function () {
    const { agent, supplier, buyerA, buyerB, custodian, usdc, eurc, group, receipt } = await deployFixture();

    const deadline = (await time.latest()) + 60 * 60 * 24 * 60;
    const expiry = (await time.latest()) + 60 * 60 * 24;

    await group.createOrder("Extra Virgin Olive Oil", "Jaén, Spain", "5-liter tins", 860, 1000, expiry);
    const orderId = 1n;

    // ~AED 15,000 ≈ USDC 4,300 at 3.67; leave headroom for FX
    await group.joinOrderFor(orderId, buyerA.address, 100, ethers.parseUnits("4300", 6), deadline, 200, "Restaurant A");
    await group.joinOrderFor(orderId, buyerB.address, 180, ethers.parseUnits("7800", 6), deadline, 200, "Restaurant B");

    // Agent funds on behalf of buyers for demo
    const fundA = ethers.parseUnits("4300", 6);
    const fundB = ethers.parseUnits("7800", 6);
    await usdc.approve(await group.getAddress(), fundA + fundB);
    await group.fundMandateFor(orderId, buyerA.address, fundA);
    await group.fundMandateFor(orderId, buyerB.address, fundB);

    // Need more demand for 860 demo — add agent as remaining buyers quickly
    await group.joinOrderFor(orderId, agent.address, 580, ethers.parseUnits("25000", 6), deadline, 200, "Pool");
    await usdc.approve(await group.getAddress(), ethers.parseUnits("25000", 6));
    await group.fundMandateFor(orderId, agent.address, ethers.parseUnits("25000", 6));

    const order = await group.getOrder(orderId);
    expect(order.totalDemand).to.equal(860n);

    // Offer: 860 * €38.10 = €32,766 EURC; USDC budget covers FX adapter rate 0.92 + fee
    const qty = 860n;
    const unit = ethers.parseUnits("38.10", 6);
    const totalEURC = qty * unit;
    const usdcBudget = ethers.parseUnits("35700", 6);
    const offerExpiry = (await time.latest()) + 300;
    const termsHash = ethers.keccak256(ethers.toUtf8Bytes("oliva-sur-860-38.10"));

    await group.submitSupplierOffer(
      orderId,
      supplier.address,
      "oliva-sur",
      qty,
      unit,
      usdcBudget,
      offerExpiry,
      termsHash
    );

    const [ok, reason] = await group.policyCheck(orderId);
    expect(ok, reason).to.equal(true);

    await group.acceptSupplierOffer(orderId);
    await group.executeSettlement(orderId);

    const settled = await group.getOrder(orderId);
    expect(settled.status).to.equal(2); // Settled
    expect(await eurc.balanceOf(supplier.address)).to.be.gt(0);

    // RWA
    await receipt.setKYB(buyerA.address, true);
    await receipt.setKYB(buyerB.address, true);
    await receipt.setKYB(agent.address, true);

    await receipt.createBatch(
      "EVOO-ES-UAE-001",
      "Extra Virgin Olive Oil",
      "Jaén, Spain",
      "5-liter tins",
      "Oliva Sur",
      custodian.address,
      860,
      orderId
    );
    const batchId = 1n;
    await receipt.registerAllocation(batchId, buyerA.address, 100);
    await receipt.registerAllocation(batchId, buyerB.address, 180);
    await receipt.registerAllocation(batchId, agent.address, 580);

    const attestation = ethers.keccak256(ethers.toUtf8Bytes("bol+invoice+packing-list"));
    await receipt.connect(custodian).verifyBatch(batchId, attestation);
    await receipt.mintAllAllocations(batchId);

    expect(await receipt.balanceOf(buyerA.address, batchId)).to.equal(100n);

    await receipt.connect(buyerA).requestRedemption(batchId, 100);
    await receipt.connect(custodian).confirmRedemption(batchId, buyerA.address, 100);
    expect(await receipt.balanceOf(buyerA.address, batchId)).to.equal(0n);
  });
});
