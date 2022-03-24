const {expect, assert} = require("chai");
const hre = require("hardhat");
const {web3} = require("hardhat");
const LFGTokenArt = hre.artifacts.require("LFGToken");
const TokenAirDropArt = hre.artifacts.require("TokenAirDrop");
const BN = require("bn.js");

const fs = require("fs");
const {parse} = require("csv-parse");

const { BigNumber } = require('bignumber.js');

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

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
      LFGToken = await LFGTokenArt.new("LFGToken", "LFG", "1000000000000000000000000000");
      TokenAirDrop = await TokenAirDropArt.new(owner, LFGToken.address);

      await LFGToken.transfer(TokenAirDrop.address, "1000000000000000000000000000");
    } catch (err) {
      console.log(err);
    }
  });

  //   beforeEach(async function () {});

  it("test airdrop to 2 address method", async function () {
    let account1Bal = await LFGToken.balanceOf(accounts[1]);
    assert.equal(account1Bal.toString(), "0");
    const accountsToDirdrop = [accounts[1], accounts[2]];
    const accountsAmounts = ["1000", "2000"];
    await expect(TokenAirDrop.airDrop(accountsToDirdrop, accountsAmounts)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
    await TokenAirDrop.airDrop(accountsToDirdrop, accountsAmounts, {from: owner});
    account1Bal = await LFGToken.balanceOf(accounts[1]);
    assert.equal(account1Bal.toString(), "1000");

    let account2Bal = await LFGToken.balanceOf(accounts[2]);
    assert.equal(account2Bal.toString(), "2000");
  });

  it("test airdrop by batches", async function () {
    const inputpath = "./test/AirdropLists.csv";
    let dataArray;
    fs.readFile(inputpath, function (err, fileData) {
      console.log(fileData);
      parse(fileData, {columns: false, trim: true}, function (err, rows) {
        // Your CSV data is in an array of arrys passed to this callback as rows.
        //console.log(rows);
        dataArray = rows;
      });
    });

    await delay(2000);

    console.log("dataArray.length ", dataArray.length);

    let batch = 500; // dataArray.length;
    let times = Math.ceil(dataArray.length / batch);
    //let times = 1;
    for (let time = 0; time < times; ++time) {
      console.log("Airdrip batch no ", time);
      let start = batch * time;
      let end = batch * (time + 1);
      if (end > dataArray.length) {
        end = dataArray.length;
      }
      let addresses = new Array();
      let amounts = new Array();
      console.log("start ", start, " end ", end);
      for (let index = start; index < end; ++index) {
        addresses.push(dataArray[index][0]);
        amounts.push(dataArray[index][2]);
      }
      //console.log(addresses);
      //console.log(amounts);

      await TokenAirDrop.airDrop(addresses, amounts, {from: owner});

      // console.log("address 0 ", addresses[0]);
      let accountBalance1 = await LFGToken.balanceOf(addresses[0]);
      assert.equal(accountBalance1.toString(), amounts[0]);

      let accountBalance2 = await LFGToken.balanceOf(addresses[addresses.length - 1]);
      assert.equal(accountBalance2.toString(), amounts[addresses.length - 1]);
    }
  });
});
