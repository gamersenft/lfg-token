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

  const LPToken: ContractFactory = await ethers.getContractFactory("BEP20");
  const lpToken: Contract = await LPToken.deploy("LP Token", "LFG LP");
  await lpToken.deployed();

  const GamersePool: ContractFactory = await ethers.getContractFactory(
    "GamersePool"
  );
  const gamersePool: Contract = await GamersePool.deploy(
    lpToken.address,
    lfgToken.address,
    "0xB34b18b191a2371359762429f9732F73af8ac211",
    "100000000000000",
    0,
    0,
    0,
    1000,
    600
  );
  await gamersePool.deployed();

  console.log("LFGToken deployed to: ", lfgToken.address);
  console.log("LPToken deployed to: ", lpToken.address);
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
