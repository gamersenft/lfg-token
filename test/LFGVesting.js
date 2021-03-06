//** Test case for LFG Vesting */
//** Author Alex Hong : LFG NFT Platform 2021.9 */

const { deployProxy, upgradeProxy } = require("@openzeppelin/truffle-upgrades");
const { assert } = require("chai");

const LFGVesting = artifacts.require("LFGVesting");
const LFGToken = artifacts.require("LFGTempToken");

const releaseTime = 1613347300000;

const advanceBlockAtTime = (time) => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_mine",
        params: [time / 1000],
        id: new Date().getTime() / 1000,
      },
      (err, _) => {
        if (err) {
          return reject(err);
        }
        const newBlockHash = web3.eth.getBlock("latest").hash;
        return resolve(newBlockHash);
      }
    );
  });
};

before(async () => {
  await advanceBlockAtTime(releaseTime + 1000);
});
contract("LFGVesting", (accounts) => {
  it("Test Vesting", async () => {
    /** get LFG token and vesting contract instance */
    const lfgToken = await LFGToken.deployed();
    const lfgVesting = await LFGVesting.deployed();

    /** print deployment details of vesting and LFG token */
    console.log("Vesting Address : ", { address: lfgVesting.address });
    console.log("LFG Token Address :", { address: lfgToken.address });

    /** test mint functionality for LFG token, mint 5 ETH to vesting */
    await lfgToken.mintToWallet(lfgVesting.address, "5000000000000000000", { from: accounts[0] });

    /** test getTotalToken function to check amount of LFG token balance */
    const vestingTokenAmount = await lfgVesting.getTotalToken(lfgToken.address);
    /** print LFG token balance of the vesting contract */
    console.log("Balance of LFG token : ", vestingTokenAmount.toString());

    /** verify if the amount of balance is correct */
    assert.equal(vestingTokenAmount, "5000000000000000000", "not same");

    /** set as strategy 1, cliff as 1 week, start date as 2020/6/30, duration 1 week */
    await lfgVesting.setVestingInfo(1, 604800, 1591818631, 604800, false, { from: accounts[0] });

    const vestingInfo = await lfgVesting.getVestingInfo(1, { from: accounts[0] });
    console.log("Vesting Info added (strategy) : ", vestingInfo.strategy);
    assert.equal("1591818631", vestingInfo.start, "not same");

    /** add new whitelist member to contract and get member */
    await lfgVesting.addWhitelist(accounts[0], "1200000000", 1, { from: accounts[0] });
    console.log("Set Whitelist Address : ", accounts[0]);
    console.log("Set Whitelist LFG amount : 1200000000 ");
    const whitelist = await lfgVesting.getWhitelist(accounts[0], { from: accounts[0] });
    console.log("Get Whitelist Address : ", whitelist.wallet.toString());
    console.log("Get Whitelist LFG amount : ", whitelist.lfgAmount.toString());
    assert.equal("1200000000", whitelist.lfgAmount, "not same");

    /** set LFG token and verify it */
    await lfgVesting.setLFGToken(lfgToken.address, { from: accounts[0] });
    const lfgAddress = await lfgVesting.getLFGToken();
    console.log("LFG Token Deployed at : ", lfgAddress);

    console.log("distrbut amount before : ", whitelist.distributedAmount);
    /** claim distribution test */
    await lfgVesting.claimDistribution(accounts[0], { from: accounts[0] });

    const whitelistAfter = await lfgVesting.getWhitelist(accounts[0], { from: accounts[0] });
    console.log("distribute amount after : ", whitelistAfter.distributedAmount);
  });
});
