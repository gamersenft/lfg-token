const {assert, expect} = require("chai");
const hre = require("hardhat");
const {web3} = require("hardhat");
const LFGTokenArt = hre.artifacts.require("LFGToken");
const GamersePoolArt = hre.artifacts.require("GamersePool");
const BN = require("bn.js");

describe("GamersePool", function () {
  let LFGToken = null;
  let GamersePool = null;
  let accounts = ["", ""],
    owner,
    rewardHolder,
    custodyAddress;

  const vestingAmount = 2000;
  const unlockedAmount = 100;

  before("Deploy contract", async function () {
    try {
      [accounts[0], accounts[1], owner, rewardHolder, custodyAddress] = await web3.eth.getAccounts();
      LFGToken = await LFGTokenArt.new("LFGToken", "LFG", "1000000000000000000000000000", owner);

      GamersePool = await GamersePoolArt.new(
        LFGToken.address,
        LFGToken.address,
        rewardHolder, // process.env.REWARD_HOLDER_ADDRESS,
        custodyAddress, // process.env.CUSTODY_ADDRESS,
        "3474635163300000000", // reward per block
        "100", //start block
        "1000", // bonus end block
        "5000", // _penaltyFee
        "100", // Panalty duration
        "10000000000000000000000", // _adMinStakeAmount
        "200" // _adDuration
      );

      await LFGToken.transfer(rewardHolder, "100000000000000000000000", {from: owner});
    } catch (err) {
      console.log(err);
    }
  });

  it("test Staking pool", async function () {
    let pendingRewardAcc1 = await GamersePool.pendingReward(accounts[1]);
    assert.equal(pendingRewardAcc1.toString(), "0");

    const testDepositAmount = "100000000000000000000000";
    await LFGToken.transfer(accounts[1], testDepositAmount, {from: owner});

    await LFGToken.increaseAllowance(GamersePool.address, testDepositAmount, {from: accounts[1]});
    await GamersePool.deposit(testDepositAmount, {from: accounts[1]});

    for (let i = 0; i < 10; ++i) {
      await hre.network.provider.send("evm_mine");
    }

    pendingRewardAcc1 = await GamersePool.pendingReward(accounts[1]);
    assert.equal(pendingRewardAcc1.toString(), "0");

    await GamersePool.updateStartAndEndBlocks("150", "1050");
    pendingRewardAcc1 = await GamersePool.pendingReward(accounts[1]);
    assert.equal(pendingRewardAcc1.toString(), "0");
  });
});
