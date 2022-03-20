const {expect, assert} = require("chai");
const hre = require("hardhat");
const {web3} = require("hardhat");
const LFGTokenArt = hre.artifacts.require("LFGToken");
const TokenAirDropArt = hre.artifacts.require("TokenAirDrop");
const BN = require("bn.js");

describe("TokenAirDrop", function () {
  let LFGToken = null;
  let TokenAirDrop = null;
  let accounts = ["", "", ""],
    owner;

  const vestingAmount = 2000;
  const unlockedAmount = 100;

  before("Deploy contract", async function () {
    try {
      [accounts[0], accounts[1], accounts[2], owner] = await web3.eth.getAccounts();
      LFGToken = await LFGTokenArt.new("LFGToken", "LFG", "1000000000000000000");
      TokenAirDrop = await TokenAirDropArt.new(owner, LFGToken.address);

      await LFGToken.transfer(TokenAirDrop.address, "100000000000000000");
    } catch (err) {
      console.log(err);
    }
  });

  //   beforeEach(async function () {});

  it("test setVestingPool method", async function () {
    let account1Bal = await LFGToken.balanceOf(accounts[1]);
    assert.equal(account1Bal.toString(), "0");
    const accountsToDirdrop = [ accounts[1], accounts[2] ];
    const accountsAmounts = ["1000", "2000"];
    await expect(TokenAirDrop.airDrop(accountsToDirdrop, accountsAmounts)).to.be.revertedWith("Ownable: caller is not the owner");
    await TokenAirDrop.airDrop(accountsToDirdrop, accountsAmounts, {from: owner});
    account1Bal = await LFGToken.balanceOf(accounts[1]);
    assert.equal(account1Bal.toString(), "1000");

    let account2Bal = await LFGToken.balanceOf(accounts[2]);
    assert.equal(account2Bal.toString(), "2000");
  });
});
