import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat"; // Optional (for `node <script>`)

async function deploy() {
  const GamersePool: ContractFactory = await ethers.getContractFactory(
    "GamersePool"
  );
  const gamersePool: Contract = await GamersePool.deploy(
    "0x82cEFec0784fDDe34396C57472A717D1e7f5506B", // process.env.LP_TOKEN_ADDRESS",
    "0x82cEFec0784fDDe34396C57472A717D1e7f5506B", // process.env.LFG_TOKEN_ADDRESS,
    "0xf197c5bC13383ef49511303065d39b33DC063f72", // process.env.REWARD_HOLDER_ADDRESS,
    "0xf197c5bC13383ef49511303065d39b33DC063f72", // process.env.CUSTODY_ADDRESS,
    "833333333333333000",
    "26363681",
    "28763681",
    "5000",
    "1728000",
    "20000000000000000000000",
    "280000"
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
