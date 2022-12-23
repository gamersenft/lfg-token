import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat"; // Optional (for `node <script>`)

async function deploy() {
  const GamersePool: ContractFactory = await ethers.getContractFactory(
    "GamersePool"
  );
  const gamersePool: Contract = await GamersePool.deploy(
    "0xF93f6b686f4A6557151455189a9173735D668154", // process.env.LP_TOKEN_ADDRESS",
    "0xF93f6b686f4A6557151455189a9173735D668154", // process.env.LFG_TOKEN_ADDRESS,
    "0xbea6Eaa4D05A9324fE19f7bDD48ec5BaD3895fFC", // process.env.REWARD_HOLDER_ADDRESS,
    "0xd1DED8e429cC944e8a14cFcc1ed9286BE3E856E7", // process.env.CUSTODY_ADDRESS,
    "579105860000000000", // 0.57910586 LFG reward per block, total reward 1M
    "24269700", // start block, 27 Dec 2022, 2PM UTC
    "25996500", // 60 days, every day 28780 blocks
    "5000",     // 50%
    "1728000",  // 20 days, 20 * 24 * 3600
    "50000000000000000000000", // minimum stake amount to get NFT airdrop, 50K
    "1439000" // minimum stake blocks to get NFT airdrop, 50 Days * 28780
  );
  await gamersePool.deployed();

  console.log("GamersePool deployed to: ", gamersePool.address);
}

async function main(): Promise<void> {
  await deploy();
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
  