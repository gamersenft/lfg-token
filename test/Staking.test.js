const {assert, expect} = require("chai");
const hre = require("hardhat");
const {web3} = require("hardhat");
const LFGTokenArt = hre.artifacts.require("LFGToken");
const GamersePoolArt = hre.artifacts.require("GamersePool");
const BN = require("bn.js");

describe("GamersePool", function () {
  let LFGToken = null;
  let GamersePool = null;
  let accounts = ["", "", ""],
    owner,
    rewardHolder,
    custodyAddress;

  const vestingAmount = 2000;
  const unlockedAmount = 100;

  before("Deploy contract", async function () {
    try {
      [accounts[0], accounts[1], accounts[2], owner, rewardHolder, custodyAddress] = await web3.eth.getAccounts();
      LFGToken = await LFGTokenArt.new("LFGToken", "LFG", "1000000000000000000000000000", owner);

      GamersePool = await GamersePoolArt.new(
        LFGToken.address,
        LFGToken.address,
        rewardHolder, // process.env.REWARD_HOLDER_ADDRESS,
        custodyAddress, // process.env.CUSTODY_ADDRESS,
        "3474635163300000000", // reward per block
        "30", //start block
        "1000", // bonus end block
        "5000", // _penaltyFee
        "1728000", // Panalty duration
        "10000000000000000000000", // _adMinStakeAmount
        "200" // _adDuration
      );

      await LFGToken.transfer(rewardHolder, "100000000000000000000000", {from: owner});

      await LFGToken.increaseAllowance(GamersePool.address, "100000000000000000000000", { from: rewardHolder });
    } catch (err) {
      console.log(err);
    }
  });

  it("test Staking pool", async function () {
    let pendingRewardAcc1 = await GamersePool.pendingReward(accounts[1]);
    assert.equal(pendingRewardAcc1.toString(), "0");

    const testDepositAmount = "100000000000000000000000";
    await LFGToken.transfer(accounts[1], testDepositAmount, {from: owner});
    await LFGToken.transfer(accounts[2], testDepositAmount, {from: owner});

    await LFGToken.increaseAllowance(GamersePool.address, testDepositAmount, {from: accounts[1]});
    await LFGToken.increaseAllowance(GamersePool.address, testDepositAmount, {from: accounts[2]});
    await GamersePool.deposit(testDepositAmount, {from: accounts[1]});
    await GamersePool.deposit(testDepositAmount, {from: accounts[2]});

    for (let i = 0; i < 10; ++i) {
      await hre.network.provider.send("evm_mine");
    }

    pendingRewardAcc1 = await GamersePool.pendingReward(accounts[1]);
    assert.equal(pendingRewardAcc1.toString(), "0");

    await GamersePool.updateStartAndEndBlocks("150", "1050");
    pendingRewardAcc1 = await GamersePool.pendingReward(accounts[1]);
    assert.equal(pendingRewardAcc1.toString(), "0");

    for (let i = 0; i < 200; ++i) {
      await hre.network.provider.send("evm_mine");
    }

    pendingRewardAcc1 = await GamersePool.pendingReward(accounts[1]);
    assert.equal(pendingRewardAcc1.toString(), "123349548200000000000");

    let totalPenelizedAmount = await GamersePool.totalPenelizedAmount();
    assert.equal(totalPenelizedAmount.toString(), "0");

    let latestBlock = await hre.ethers.provider.getBlock("latest");


    await GamersePool.withdraw(testDepositAmount, {from: accounts[1]});

    totalPenelizedAmount = await GamersePool.totalPenelizedAmount();
    assert.equal(totalPenelizedAmount.toString(), "62543432900000000000");

    const allUsers = await GamersePool.getAllUsers();
    assert.equal(allUsers.length, 2);
    assert.equal(allUsers[0], accounts[1]);
    assert.equal(allUsers[1], accounts[2]);
  });
});
