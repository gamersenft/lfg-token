const GamersePool = artifacts.require("GamersePool");
const LFGToken = artifacts.require("LFGToken");
const { BigNumber } = require('bignumber.js');

const truffleAssert = require('truffle-assertions');
const { BN, ether, constants, expectEvent, shouldFail, time } = require('@openzeppelin/test-helpers');
const { assert } = require('chai');

contract('GamersePool', (accounts) => {

   let lfgToken;
   let poolInst;
   beforeEach('should setup the contract instance', async () => {
      lfgToken = await LFGToken.deployed();
      console.log("token name", lfgToken.name());

      poolInst = await GamersePool.deployed();
      //let poolInst = await GamersePool.at("0x2Fa9eC5d00E2e4276744bAf0f148dfDed5887Ae9");
      console.log("poolInst address ", poolInst.address);
   });

   // it("basic staking pool test", async () => {
   //    const lfgToken = await LFGToken.at("0x8e62D118158D80DdAa748D58c1965E1061D50B8a");
   //    console.log("token name", lfgToken.name());

   //    let total = await lfgToken.totalSupply();
   //    console.log("Initial total supply: ", total.toString());

   //    await lfgToken.mint(100000);

   //    total = await lfgToken.totalSupply();
   //    console.log("After mint total supply: ", total.toString());

   //    let allow = await lfgToken.allowance(accounts[1], accounts[1]);
   //    console.log("Initial allowance: ", allow.toString());

   //    let increseAllowanceEvent = await lfgToken.increaseAllowance(accounts[1], 1000000, {from: accounts[1]});
   //    truffleAssert.prettyPrintEmittedEvents(increseAllowanceEvent);

   //    allow = await lfgToken.allowance(accounts[1], accounts[1]);
   //    console.log("After increase allowance: ", allow.toString());

   //    await lfgToken.transfer(accounts[1], 100000);

   //    const balance = await lfgToken.balanceOf(accounts[1]);
   //    console.log("Account balance: ", balance.toString());

   //    let poolInst = await GamersePool.deployed();
   //    console.log("poolInst address ", poolInst.address);

   //    increseAllowanceEvent = await lfgToken.increaseAllowance(poolInst.address, 1000000, {from: accounts[1]});
   //    truffleAssert.prettyPrintEmittedEvents(increseAllowanceEvent);

   //    allow = await lfgToken.allowance(accounts[1], poolInst.address);
   //    console.log("Allowance of the pool ", allow.toString());

   //    let value = await poolInst.pendingReward(accounts[1]);
   //    assert.equal(value, 0);

   //    let depositEvent = await poolInst.deposit(100000, {from: accounts[1]});

   //    truffleAssert.prettyPrintEmittedEvents(depositEvent);

   //    const lrb = await poolInst.lastRewardBlock();
   //    console.log("lastRewardBlock: ", lrb.toString());

   //    for (let i = 0; i < 10; ++i) {
   //       await time.advanceBlock();
   //    }

   //    value = await poolInst.pendingReward(accounts[1]);
   //    console.log("After deposit rewards: ", value.toString());

   //    const withdrawEvent = await poolInst.withdraw(3898500000000000, {from: accounts[1]});
   //    truffleAssert.prettyPrintEmittedEvents(withdrawEvent);
   // });

   // it("two accounts staking pool test", async () => {
   //    const lfgToken = await LFGToken.at("0x8e62D118158D80DdAa748D58c1965E1061D50B8a");
   //    console.log("token name", lfgToken.name());

   //    let total = await lfgToken.totalSupply();
   //    console.log("Initial total supply: ", total.toString());

   //    await lfgToken.mint(1000000000000000);

   //    total = await lfgToken.totalSupply();
   //    console.log("After mint total supply: ", total.toString());

   //    let allow = await lfgToken.allowance(accounts[1], accounts[1]);
   //    console.log("Initial allowance: ", allow.toString());

   //    let increseAllowanceEvent = await lfgToken.increaseAllowance(accounts[1], 1000000, {from: accounts[1]});
   //    truffleAssert.prettyPrintEmittedEvents(increseAllowanceEvent);
   //    increseAllowanceEvent = await lfgToken.increaseAllowance(accounts[2], 1000000, {from: accounts[2]});
   //    truffleAssert.prettyPrintEmittedEvents(increseAllowanceEvent);

   //    allow = await lfgToken.allowance(accounts[1], accounts[1]);
   //    console.log("After increase allowance: ", allow.toString());

   //    const testDepositAmount = 55000000;

   //    await lfgToken.transfer(accounts[1], testDepositAmount);
   //    await lfgToken.transfer(accounts[2], testDepositAmount);

   //    const balance = await lfgToken.balanceOf(accounts[1]);
   //    console.log("Account balance: ", balance.toString());

   //    let poolInst = await GamersePool.deployed();
   //    //let poolInst = await GamersePool.at("0x2Fa9eC5d00E2e4276744bAf0f148dfDed5887Ae9");
   //    console.log("poolInst address ", poolInst.address);

   //    // Initialize the reward holder address
   //    const rewardHolder = await poolInst.rewardHolder();
   //    console.log("Reward holder: ", rewardHolder);
   //    await lfgToken.transfer(rewardHolder, 38985000000);

   //    increseAllowanceEvent = await lfgToken.increaseAllowance(poolInst.address, testDepositAmount, {from: accounts[1]});
   //    truffleAssert.prettyPrintEmittedEvents(increseAllowanceEvent);

   //    increseAllowanceEvent = await lfgToken.increaseAllowance(poolInst.address, testDepositAmount, {from: accounts[2]});
   //    truffleAssert.prettyPrintEmittedEvents(increseAllowanceEvent);

   //    // Need to set this otherwise cannot withdraw
   //    increseAllowanceEvent = await lfgToken.increaseAllowance(accounts[1], 100000000000000);
   //    truffleAssert.prettyPrintEmittedEvents(increseAllowanceEvent);

   //    increseAllowanceEvent = await lfgToken.increaseAllowance(accounts[1], 100000000000000, {from: rewardHolder});
   //    increseAllowanceEvent = await lfgToken.increaseAllowance(accounts[9], 100000000000000, {from: rewardHolder});
   //    increseAllowanceEvent = await lfgToken.increaseAllowance(poolInst.address, 100000000000000, {from: rewardHolder});

   //    allow = await lfgToken.allowance(accounts[1], poolInst.address);
   //    console.log("Allowance of the pool from accounts[1] ", allow.toString());

   //    let value = await poolInst.pendingReward(accounts[1]);
   //    assert.equal(value, 0);

   //    let depositEvent;
   //    depositEvent = await poolInst.deposit(testDepositAmount, {from: accounts[2]});
   //    depositEvent = await poolInst.deposit(testDepositAmount, {from: accounts[1]});

   //    truffleAssert.prettyPrintEmittedEvents(depositEvent);

   //    const lrb = await poolInst.lastRewardBlock();
   //    console.log("lastRewardBlock: ", lrb.toString());

   //    for (let i = 0; i < 10; ++i) {
   //       await time.advanceBlock();
   //    }

   //    value = await poolInst.pendingReward(accounts[1]);
   //    console.log("After deposit account 1 rewards: ", value.toString());

   //    value = await poolInst.pendingReward(accounts[2]);
   //    console.log("After deposit account 2 rewards: ", value.toString());

   //    allow = await lfgToken.allowance(poolInst.address, accounts[1]);
   //    console.log("Allowance for account[1] from contract: ", allow.toString());
   //    allow = await lfgToken.allowance(poolInst.address, accounts[2]);
   //    console.log("Allowance for account[2] from contract: ", allow.toString());

   //    allow = await lfgToken.allowance(rewardHolder, accounts[9]);
   //    console.log("Allowance for custody from reward holder: ", allow.toString());
   //    allow = await lfgToken.allowance(rewardHolder, accounts[1]);
   //    console.log("Allowance for account[1] from reward holder: ", allow.toString());

   //    const withdrawEvent = await poolInst.withdraw(testDepositAmount, {from: accounts[1]});
   //    truffleAssert.prettyPrintEmittedEvents(withdrawEvent);

   //    lfgToken.transferFrom(rewardHolder, accounts[1], 100000, {from: rewardHolder});

   //    value = await poolInst.pendingReward(accounts[2]);
   //    console.log("After withdraw account 2 rewards: ", value.toString());
   // });

   // it("user staking limit test", async () => {
   //    let total = await lfgToken.totalSupply();
   //    console.log("Initial total supply: ", total.toString());

   //    const testAccount =  accounts[3];
   //    let allow = await lfgToken.allowance(testAccount, testAccount);
   //    console.log("Initial allowance: ", allow.toString());

   //    const defaultMaxStakeAmount = "500000000000000000000000"
   //    const testDepositAmount     = "100000000000000000000000";
   //    const whaleAmount           = "1000000000000000000000000";

   //    await lfgToken.transfer(testAccount, whaleAmount);
   //    await lfgToken.increaseAllowance(poolInst.address, whaleAmount, { from: testAccount });

   //    let balance = await lfgToken.balanceOf(testAccount);
   //    console.log("balance of whale: ", balance.toString());

   //    let depositEvent;
   //    depositEvent = await poolInst.deposit(testDepositAmount, {from: testAccount});
   //    truffleAssert.prettyPrintEmittedEvents(depositEvent);

   //    depositEvent = await poolInst.deposit("400000000000000000000000", { from: testAccount });
   //    truffleAssert.prettyPrintEmittedEvents(depositEvent);

   //    // deposit fail here
   //    await truffleAssert.reverts(poolInst.deposit(1, { from: testAccount }));

   //    await poolInst.updateMaxStakeAmount(whaleAmount);

   //    // default should can success after update limit
   //    poolInst.deposit(1, { from: testAccount });
   // });

   it("one account stake first, second accout stake pool test", async () => {
      let total = await lfgToken.totalSupply();
      console.log("Initial total supply: ", total.toString());

      let allow = await lfgToken.allowance(accounts[1], accounts[1]);
      console.log("Initial allowance: ", allow.toString());

      let increseAllowanceEvent = await lfgToken.increaseAllowance(accounts[1], 1000000, { from: accounts[1] });
      truffleAssert.prettyPrintEmittedEvents(increseAllowanceEvent);
      increseAllowanceEvent = await lfgToken.increaseAllowance(accounts[2], 1000000, { from: accounts[2] });
      truffleAssert.prettyPrintEmittedEvents(increseAllowanceEvent);

      allow = await lfgToken.allowance(accounts[1], accounts[1]);
      console.log("After increase allowance: ", allow.toString());

      const testDepositAmount = "100000000000000000000000";
      const halfDepositAmount = "50000000000000000000000";
      const rewardAccountAmount = "30885645896000000000000";

      await lfgToken.transfer(accounts[1], testDepositAmount);
      await lfgToken.transfer(accounts[2], testDepositAmount);
      await lfgToken.transfer(poolInst.address, testDepositAmount);

      const balance = await lfgToken.balanceOf(accounts[1]);
      console.log("Account balance: ", balance.toString());

      // Initialize the reward holder address
      const rewardHolder = await poolInst.rewardHolder();
      console.log("Reward holder: ", rewardHolder);
      await lfgToken.transfer(rewardHolder, rewardAccountAmount);

      increseAllowanceEvent = await lfgToken.increaseAllowance(poolInst.address, testDepositAmount, { from: accounts[1] });
      truffleAssert.prettyPrintEmittedEvents(increseAllowanceEvent);

      increseAllowanceEvent = await lfgToken.increaseAllowance(poolInst.address, testDepositAmount, { from: accounts[2] });
      truffleAssert.prettyPrintEmittedEvents(increseAllowanceEvent);

      // Need to set this otherwise cannot withdraw
      increseAllowanceEvent = await lfgToken.increaseAllowance(accounts[1], 100000000000000);
      truffleAssert.prettyPrintEmittedEvents(increseAllowanceEvent);

      increseAllowanceEvent = await lfgToken.increaseAllowance(poolInst.address, rewardAccountAmount, { from: rewardHolder });

      allow = await lfgToken.allowance(accounts[1], poolInst.address);
      console.log("Allowance of the pool from accounts[1] ", allow.toString());

      let value = await poolInst.pendingReward(accounts[1]);
      assert.equal(value, 0);

      let depositEvent;
      depositEvent = await poolInst.deposit(halfDepositAmount, { from: accounts[1] });
      truffleAssert.prettyPrintEmittedEvents(depositEvent);

      const startBlock = await time.latestBlock();

      let lrb;
      lrb = await poolInst.lastRewardBlock();
      console.log("lastRewardBlock: ", lrb.toString());

      for (let i = 0; i < 10; ++i) {
         await time.advanceBlock();
      }

      depositEvent = await poolInst.deposit(halfDepositAmount, { from: accounts[1] });
      truffleAssert.prettyPrintEmittedEvents(depositEvent);

      let user;
      user = await poolInst.userInfo(accounts[1]);
      console.log("User of account 1: ", JSON.stringify(user));

      value = await poolInst.pendingReward(accounts[1]);
      console.log("After account 1 deposit account 1 rewards: ", value.toString());

      depositEvent = await poolInst.deposit(testDepositAmount, { from: accounts[2] });
      truffleAssert.prettyPrintEmittedEvents(depositEvent);

      for (let i = 0; i < 20; ++i) {
         await time.advanceBlock();
      }

      const rewardPerBlock = new BigNumber(await poolInst.rewardPerBlock());
      let blockNum;
      blockNum = await time.latestBlock();

      console.log("startBlock ", startBlock.toString(), " blockNum ", blockNum.toString());
      const expectedReward = rewardPerBlock.multipliedBy(blockNum - startBlock);
      let actualReward1 = new BigNumber(await poolInst.pendingReward(accounts[1]));
      let actualReward2 = new BigNumber(await poolInst.pendingReward(accounts[2]));

      let totalActualReward = actualReward1.plus(actualReward2);
      console.log("totalActualReward ", totalActualReward.toString(), " expectedReward ", expectedReward.toString());
      let diffrenace = expectedReward.minus(totalActualReward);
      console.log("difference: ", diffrenace.toString());

      assert.isTrue(expectedReward.minus(totalActualReward).comparedTo(new BigNumber("1000000000000")) < 0, "Reward difference to big");

      let totalStaked = await poolInst.totalStakedAmount();
      let contractBalance = await lfgToken.balanceOf(poolInst.address);
      console.log("totalStaked ", totalStaked.toString(), " contractBalance ", contractBalance.toString());

      lrb = await poolInst.lastRewardBlock();
      console.log("lastRewardBlock: ", lrb.toString());

      value = await poolInst.pendingReward(accounts[1]);
      console.log("After account 2 deposit account 1 rewards: ", value.toString());

      value = await poolInst.pendingReward(accounts[2]);
      console.log("After account 2 deposit account 2 rewards: ", value.toString());

      allow = await lfgToken.allowance(poolInst.address, accounts[1]);
      console.log("Allowance for account[1] from contract: ", allow.toString());
      allow = await lfgToken.allowance(poolInst.address, accounts[2]);
      console.log("Allowance for account[2] from contract: ", allow.toString());

      allow = await lfgToken.allowance(rewardHolder, accounts[9]);
      console.log("Allowance for custody from reward holder: ", allow.toString());
      allow = await lfgToken.allowance(rewardHolder, accounts[1]);
      console.log("Allowance for account[1] from reward holder: ", allow.toString());

      let withdrawEvent;
      withdrawEvent = await poolInst.withdraw(0, { from: accounts[2] });
      truffleAssert.prettyPrintEmittedEvents(withdrawEvent);

      let accountPerShare;
      accountPerShare = await poolInst.accTokenPerShare();
      console.log("accountPerShare ", accountPerShare.toString());

      value = await poolInst.pendingReward(accounts[2]);
      console.log("After withdraw half account 2 rewards: ", value.toString());

      for (let i = 0; i < 10; ++i) {
         await time.advanceBlock();
      }

      value = await poolInst.pendingReward(accounts[2]);
      console.log("After another 10 blocks account 2 rewards: ", value.toString());

      // Update the pool last reward block to test if user's withdraw not get reward penalized.
      {
         let latestBlock = await time.latestBlock();
         console.log("latestBlock before updateStartAndEndBlocks: ", latestBlock.toString());
         await poolInst.updateStartAndEndBlocks(latestBlock.add(new BN('2')), latestBlock.add(new BN('10')));
         for (let i = 0; i < 11; ++i) {
            await time.advanceBlock();
         }

         const newLrb = await poolInst.lastRewardBlock();
         console.log("new lastRewardBlock: ", newLrb.toString());

         latestBlock = await time.latestBlock();
         console.log("latestBlock before withdraw: ", latestBlock.toString());
      }

      withdrawEvent = await poolInst.withdraw(halfDepositAmount, { from: accounts[2] });
      truffleAssert.prettyPrintEmittedEvents(withdrawEvent);

      accountPerShare = await poolInst.accTokenPerShare();
      console.log("accountPerShare ", accountPerShare.toString());

      user = await poolInst.userInfo(accounts[1]);
      console.log("User of account 1: ", JSON.stringify(user));

      totalStaked = await poolInst.totalStakedAmount();
      contractBalance = await lfgToken.balanceOf(poolInst.address);
      console.log("totalStaked ", totalStaked.toString(), " contractBalance ", contractBalance.toString());
   });

   // it("Airdrop test", async () => {
   //    const lfgToken = await LFGToken.at("0x8e62D118158D80DdAa748D58c1965E1061D50B8a");
   //    console.log("token name", lfgToken.name());

   //    let total = await lfgToken.totalSupply();
   //    console.log("Initial total supply: ", total.toString());

   //    await lfgToken.mint(100000);

   //    total = await lfgToken.totalSupply();
   //    console.log("After mint total supply: ", total.toString());

   //    let allow = await lfgToken.allowance(accounts[1], accounts[1]);
   //    console.log("Initial allowance: ", allow.toString());

   //    let increseAllowanceEvent = await lfgToken.increaseAllowance(accounts[1], 1000000, { from: accounts[1] });
   //    truffleAssert.prettyPrintEmittedEvents(increseAllowanceEvent);

   //    allow = await lfgToken.allowance(accounts[1], accounts[1]);
   //    console.log("After increase allowance: ", allow.toString());

   //    await lfgToken.transfer(accounts[1], 100000);

   //    const balance = await lfgToken.balanceOf(accounts[1]);
   //    console.log("Account balance: ", balance.toString());

   //    let poolInst = await GamersePool.deployed();
   //    console.log("poolInst address ", poolInst.address);

   //    increseAllowanceEvent = await lfgToken.increaseAllowance(poolInst.address, 1000000, { from: accounts[1] });
   //    truffleAssert.prettyPrintEmittedEvents(increseAllowanceEvent);

   //    const rewardHolder = await poolInst.rewardHolder();
   //    increseAllowanceEvent = await lfgToken.increaseAllowance(poolInst.address, 100000000000000, {from: rewardHolder});
   //    truffleAssert.prettyPrintEmittedEvents(increseAllowanceEvent);

   //    allow = await lfgToken.allowance(accounts[1], poolInst.address);
   //    console.log("Allowance of the pool ", allow.toString());

   //    let value = await poolInst.pendingReward(accounts[1]);
   //    assert.equal(value, 0);

   //    let depositEvent = await poolInst.deposit(100000, { from: accounts[1] });

   //    truffleAssert.prettyPrintEmittedEvents(depositEvent);

   //    const lrb = await poolInst.lastRewardBlock();
   //    console.log("lastRewardBlock: ", lrb.toString());

   //    for (let i = 0; i < 20; ++i) {
   //       await time.advanceBlock();
   //    }

   //    value = await poolInst.pendingReward(accounts[1]);
   //    console.log("After deposit rewards: ", value.toString());

   //    const withdrawEvent = await poolInst.withdraw(100000, { from: accounts[1] });
   //    truffleAssert.prettyPrintEmittedEvents(withdrawEvent);
   // });
});
