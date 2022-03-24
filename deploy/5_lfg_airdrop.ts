import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat"; // Optional (for `node <script>`)

async function deploy() {
  const TokenAirDrop: ContractFactory = await ethers.getContractFactory(
    "TokenAirDrop"
  );
  const tokenAirDrop: Contract = await TokenAirDrop.deploy();
  await tokenAirDrop.deployed();
  console.log("TokenAirDrop deployed to: ", tokenAirDrop.address);
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
