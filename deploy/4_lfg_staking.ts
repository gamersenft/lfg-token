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
    "3474635163300000000",
    "16399348",
    "18126148",
    "5000",
    "1728000",
    "10000000000000000000000",
    "201460"
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
  