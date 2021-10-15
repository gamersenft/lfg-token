const {expect} = require("chai");
const hre = require("hardhat");
const {web3} = require("hardhat");
const LFGTokenArt = hre.artifacts.require("LFGToken");
const LFGVestingArt = hre.artifacts.require("LFGVesting");
const BN = require("bn.js");

describe("LFGVesting", function () {
  let LFGToken = null;
  let LFGVesting = null;
  let accounts = ["", ""],
    minter;

  before("Deploy contract", async function () {
    try {
      [accounts[0], accounts[1], minter] = await web3.eth.getAccounts();
      LFGToken = await LFGTokenArt.new("LFGToken", "LFG", 10000);
      LFGVesting = await LFGVestingArt.new();
      await LFGVesting.setLFGToken(LFGToken.address);
      await LFGToken.transfer(LFGVesting.address, 5000);
    } catch (err) {
      console.log(err);
    }
  });

  //   beforeEach(async function () {});

  it("test setVestingPool method", async function () {
    const today = Math.round(new Date() / 1000);
    await hre.network.provider.send("evm_setNextBlockTimestamp", [today]);
    await hre.network.provider.send("evm_mine");
    await LFGVesting.setVestingInfo(1, 1000, today, 86400);

    const vestingInfo = await LFGVesting.vestingPools(1);
    expect(new BN(vestingInfo.strategy).toString()).to.equal("1");
    expect(new BN(vestingInfo.cliff).toString()).to.equal((today + 1000).toString());
    expect(new BN(vestingInfo.start).toString()).to.equal(today.toString());
    expect(new BN(vestingInfo.duration).toString()).to.equal("86400");
    expect(vestingInfo.active).to.equal(true);
  });

  it("test addWhiteList method", async function () {
    const vestingAmount = 2000;
    await LFGVesting.addWhitelist(accounts[1], vestingAmount, 1);

    const whitelistInfo = await LFGVesting.whitelistPools(accounts[1]);
    expect(new BN(whitelistInfo.lfgAmount).toString()).to.equal(vestingAmount.toString());
    expect(new BN(whitelistInfo.distributedAmount).toString()).to.equal("0");
    expect(new BN(whitelistInfo.vestingOption).toString()).to.equal("1");
    expect(whitelistInfo.active).to.equal(true);
    expect(whitelistInfo.wallet).to.equal(accounts[1]);
  });

  it("test claimDistribution method", async function () {
    await hre.network.provider.send("evm_increaseTime", [1000]);
    await hre.network.provider.send("evm_mine");
    const pending = await LFGVesting.calculateReleasableAmount(accounts[1]);

    let whitelistInfo = await LFGVesting.whitelistPools(accounts[1]);
    const vestingInfo = await LFGVesting.vestingPools(1);
    const releasable = new BN(whitelistInfo.lfgAmount)
      .mul(new BN(1000))
      .div(new BN(vestingInfo.duration))
      .sub(new BN(whitelistInfo.distributedAmount))
      .toString();

    expect(new BN(pending).toString()).to.equal(releasable);

    await LFGVesting.claimDistribution({from: accounts[1]});
    expect(new BN(await LFGToken.balanceOf(accounts[1])).toString()).to.equal(releasable);

    whitelistInfo = await LFGVesting.whitelistPools(accounts[1]);
    expect(new BN(whitelistInfo.distributedAmount).toString()).to.equal(releasable);
    expect(whitelistInfo.active).to.equal(true);
    expect(whitelistInfo.wallet).to.equal(accounts[1]);
  });
});
