import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat"; // Optional (for `node <script>`)

async function deploy() {
  const LFGToken: ContractFactory = await ethers.getContractFactory("LFGToken");
  const lfgToken: Contract = await LFGToken.deploy(
    "LFG Token",
    "LFG",
    "1000000000000000000000000000"
  );
  await lfgToken.deployed();

  console.log("LFGToken deployed to: ", lfgToken.address);
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
