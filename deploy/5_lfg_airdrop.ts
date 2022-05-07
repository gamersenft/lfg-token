import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat"; // Optional (for `node <script>`)

async function deploy() {
  const TokenAirDrop: ContractFactory = await ethers.getContractFactory(
    "TokenAirDrop"
  );
  const tokenAirDrop: Contract = await TokenAirDrop.deploy(
    "0x3ca3822163D049364E67bE19a0D3B2F03B7e99b5", // owner
    "0xc4f7Cf2Cbc05970105f424586eeCAF96F980Db8d"  // token
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
