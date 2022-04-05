import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat"; // Optional (for `node <script>`)

async function deploy() {
  const TokenAirDrop: ContractFactory = await ethers.getContractFactory(
    "TokenAirDrop"
  );
  const tokenAirDrop: Contract = await TokenAirDrop.deploy(
    "0xF42EBbF89D8fB9eA0a87d836C49CfD688EC5b2b6", // owner
    "0xF93f6b686f4A6557151455189a9173735D668154"  // token
  );
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
