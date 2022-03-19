const {expect, assert} = require("chai");
const hre = require("hardhat");
const {web3} = require("hardhat");
const LFGTokenArt = hre.artifacts.require("LFGToken");
const BPContractArt = hre.artifacts.require("BPContractImpl");

describe("LFGToken", function () {
  let LFGToken = null;
  let BPContract = null;
  let accounts = ["", "", ""],
    owner;

  before("Deploy contract", async function () {
    try {
      [accounts[0], accounts[1], accounts[2], owner] = await web3.eth.getAccounts();
      LFGToken = await LFGTokenArt.new("LFGToken", "LFG", "10000000000000000000");
      BPContract = await BPContractArt.new(owner);

      await LFGToken.setBPAddress(BPContract.address);
      await LFGToken.setBpEnabled(true);
    } catch (err) {
      console.log(err);
    }
  });

  it("test token transfer", async function () {
    let testAmount = "100000000";
    await LFGToken.transfer(accounts[1], testAmount, {from: accounts[0]});
    let account1Bal = await LFGToken.balanceOf(accounts[1]);
    assert.equal(account1Bal.toString(), testAmount);

    await LFGToken.transfer(accounts[2], "50000", {from: accounts[1]});

    // blacklist account 1
    await BPContract.setBlacklist(accounts[1], true, {from: owner});

    await expect(LFGToken.transfer(accounts[2], "50000", {from: accounts[1]})).to.be.revertedWith("Address is blocked");
  });
});
