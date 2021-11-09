import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat"; // Optional (for `node <script>`)

async function deploy() {
  const Locker: ContractFactory = await ethers.getContractFactory("TokenLock");
  const locker: Contract = await Locker.deploy(
    "0xcca6df3c9e888ba411de5b4452c43356ee15f44e",
    "0x05af2dceB0312ddD4433E2959AEAbbcdB4CD4c5E",
    "1651201200"
  );
  await locker.deployed();

  console.log("Locker deployed to: ", locker.address);
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
