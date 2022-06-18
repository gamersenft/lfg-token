import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat"; // Optional (for `node <script>`)

async function deploy() {
  const TokenAirDrop: ContractFactory = await ethers.getContractFactory(
    "TokenAirDrop"
  );
  const tokenAirDrop: Contract = await TokenAirDrop.deploy(
    "0x8668334e671A62f6994166D82d177789d975128F", // owner
    "0x411bE1E071675dF40fE1c08CA760Bb7aA707CEdF"  // token
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
