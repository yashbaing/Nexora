import { ethers } from "ethers";

const L1_RPC = "http://127.0.0.1:9654/ext/bc/2M4yVQxvusf3M87KM5uDYVoGm7cum8XjjdVKPmoubmgAxgRerv/rpc";
const AIRDROP_KEY = "0x51767861fd278a63460bac8feaa497fe0b3a16ad2cb145093d2e0f9f7011894a";
const DEPLOYER_ADDRESS = "0x6A63340D6d071C808Ec69D9fd570D1dF284A453f"; // oracle signer / deployer

async function main() {
  const provider = new ethers.JsonRpcProvider(L1_RPC);
  const airdrop = new ethers.Wallet(AIRDROP_KEY, provider);

  console.log("Airdrop address:", airdrop.address);
  const balance = await provider.getBalance(airdrop.address);
  console.log("Airdrop balance:", ethers.formatEther(balance), "NXR");

  console.log("Sending 100 NXR to deployer:", DEPLOYER_ADDRESS);
  const tx = await airdrop.sendTransaction({
    to: DEPLOYER_ADDRESS,
    value: ethers.parseEther("100"),
  });
  await tx.wait();
  console.log("✅ Funded deployer. Tx:", tx.hash);

  const newBal = await provider.getBalance(DEPLOYER_ADDRESS);
  console.log("Deployer balance:", ethers.formatEther(newBal), "NXR");
}

main().catch(console.error);
