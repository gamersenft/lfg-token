import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat"; // Optional (for `node <script>`)

async function deploy() {
  const LFGVesting: ContractFactory = await ethers.getContractFactory(
    "LFGVesting"
  );
  const lfgVesting: Contract = await LFGVesting.deploy();
  await lfgVesting.deployed();
  console.log("LFGVesting deployed to: ", lfgVesting.address);
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
