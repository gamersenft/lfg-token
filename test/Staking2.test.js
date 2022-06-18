const {assert, expect} = require("chai");
const hre = require("hardhat");
const {web3} = require("hardhat");
const LFGTokenArt = hre.artifacts.require("LFGToken");
const GamersePoolArt = hre.artifacts.require("GamersePool2");

describe("GamersePool2", function () {
  let LFGToken = null;
  let GamersePool = null;
  let accounts = ["", ""],
    owner,
    custodyAddress;

  const vestingAmount = 2000;
  const unlockedAmount = 100;

  before("Deploy contract", async function () {
    try {
      [accounts[0], accounts[1], owner, custodyAddress] = await web3.eth.getAccounts();
      LFGToken = await LFGTokenArt.new("LFGToken", "LFG", "1000000000000000000000000000", owner);

      GamersePool = await GamersePoolArt.new(
        owner,
        LFGToken.address,
        LFGToken.address,
        custodyAddress, // process.env.CUSTODY_ADDRESS,
        "3474635163300000000", // reward per block
        "100", //start block
        "1000", // bonus end block
        "5000", // _penaltyFee
        "100000", // Panalty duration
        "10000000000000000000000", // _adMinStakeAmount
        "200" // _adDuration
      );

      await LFGToken.transfer(GamersePool.address, "100000000000000000000000", {from: owner});
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

    await GamersePool.updateStartAndEndBlocks("150", "1050", {from: owner});
    pendingRewardAcc1 = await GamersePool.pendingReward(accounts[1]);
    assert.equal(pendingRewardAcc1.toString(), "0");
  });

  it("basic staking pool test", async function () {
    for (let i = 0; i < 200; ++i) {
      await hre.network.provider.send("evm_mine");
    }

    let balanceofCustody = await LFGToken.balanceOf(custodyAddress);
    assert.equal(balanceofCustody.toString(), "0");

    pendingRewardAcc1 = await GamersePool.pendingReward(accounts[1]);
    console.log("Pending rewards: ", pendingRewardAcc1.toString());
    assert.equal(pendingRewardAcc1.toString(), "232800555900000000000");

    const testDepositAmount = "100000000000000000000000";

    await expect(GamersePool.withdraw(testDepositAmount, {from: accounts[1]})).to.be.revertedWith(
      "Reward balance is not enough"
    );

    const rewardsToAdd = "100000000000000000000000";
    await LFGToken.approve(GamersePool.address, rewardsToAdd, {from: owner});
    await GamersePool.addReward(rewardsToAdd, {from: owner});

    let rewardBalance = await GamersePool.rewardBalance();
    assert.equal(rewardBalance.toString(), rewardsToAdd);

    await GamersePool.withdraw(testDepositAmount, {from: accounts[1]});

    balanceofCustody = await LFGToken.balanceOf(custodyAddress);
    assert.equal(balanceofCustody.toString(), "123349548250000000000");

    rewardBalance = await GamersePool.rewardBalance();
    assert.equal(rewardBalance.toString(), "99753300903500000000000");

    let rewardedAmount = await GamersePool.rewardedAmount();
    assert.equal(rewardedAmount.toString(), "246699096500000000000");
  });
});
