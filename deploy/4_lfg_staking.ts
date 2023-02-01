import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat"; // Optional (for `node <script>`)

async function deploy() {
  const GamersePool: ContractFactory = await ethers.getContractFactory(
    "GamersePool"
  );
  const gamersePool: Contract = await GamersePool.deploy(
    "0x411bE1E071675dF40fE1c08CA760Bb7aA707CEdF", // process.env.LP_TOKEN_ADDRESS",
    "0x411bE1E071675dF40fE1c08CA760Bb7aA707CEdF", // process.env.LFG_TOKEN_ADDRESS,
    "0x8668334e671A62f6994166D82d177789d975128F", // process.env.REWARD_HOLDER_ADDRESS,
    "0xd1DED8e429cC944e8a14cFcc1ed9286BE3E856E7", // process.env.CUSTODY_ADDRESS,
    "579105860000000000", // 0.57910586 LFG reward per block, total reward 1M
    "38311600", // Start block, around 20 Jan 2023, 2PM UTC
    "40711600", // Bonus end block = start block + 60 * 40000
    "5000", // Penalty rate, 50%
    "1728000", // Penalty duration in seconds, 20 days
    "50000000000000000000000", // Staking for NFT airdrop, 50K
    "2000000" // Staking duration in blocks for NFT airdrop, 50 Days * 40000
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
