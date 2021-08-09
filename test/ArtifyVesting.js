//** Test case for Artify Vesting */
//** Author Alex Hong : Artify NFT Platform 2021.8 */

const { deployProxy, upgradeProxy } = require("@openzeppelin/truffle-upgrades");
const { assert } = require("chai");

const ArtifyVesting = artifacts.require("ArtifyVesting");
const ArtifyToken = artifacts.require("ArtifyTempToken");

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
contract("ArtifyVesting", (accounts) => {
  it("Test Vesting", async () => {
    /** get Artify token and vesting contract instance */
    const artifyToken = await ArtifyToken.deployed();
    const artifyVesting = await ArtifyVesting.deployed();

    /** print deployment details of vesting and Artify token */
    console.log("Vesting Address : ", { address: artifyVesting.address });
    console.log("Artify Token Address :", { address: artifyToken.address });

    /** test mint functionality for Artify token, mint 5 ETH to vesting */
    await artifyToken.mintToWallet(artifyVesting.address, "5000000000000000000", { from: accounts[0] });

    /** test getTotalToken function to check amount of Artify token balance */
    const vestingTokenAmount = await artifyVesting.getTotalToken(artifyToken.address);
    /** print Artify token balance of the vesting contract */
    console.log("Balance of Artify token : ", vestingTokenAmount.toString());

    /** verify if the amount of balance is correct */
    assert.equal(vestingTokenAmount, "5000000000000000000", "not same");

    /** set as strategy 1, cliff as 1 week, start date as 2020/6/30, duration 1 week */
    await artifyVesting.setVestingInfo(1, 604800, 1591818631, 604800, false, { from: accounts[0] });

    const vestingInfo = await artifyVesting.getVestingInfo(1, { from: accounts[0] });
    console.log("Vesting Info added (strategy) : ", vestingInfo.strategy);
    assert.equal("1591818631", vestingInfo.start, "not same");

    /** add new whitelist member to contract and get member */
    await artifyVesting.addWhitelist(accounts[0], "1200000000", 1, { from: accounts[0] });
    console.log("Set Whitelist Address : ", accounts[0]);
    console.log("Set Whitelist Artify amount : 1200000000 ");
    const whitelist = await artifyVesting.getWhitelist(accounts[0], { from: accounts[0] });
    console.log("Get Whitelist Address : ", whitelist.wallet.toString());
    console.log("Get Whitelist Artify amount : ", whitelist.artifyAmount.toString());
    assert.equal("1200000000", whitelist.artifyAmount, "not same");

    /** set Artify token and verify it */
    await artifyVesting.setArtifyToken(artifyToken.address, { from: accounts[0] });
    const artifyAddress = await artifyVesting.getArtifyToken();
    console.log("Artify Token Deployed at : ", artifyAddress);

    console.log("distrbut amount before : ", whitelist.distributedAmount);
    /** claim distribution test */
    await artifyVesting.claimDistribution(accounts[0], { from: accounts[0] });

    const whitelistAfter = await artifyVesting.getWhitelist(accounts[0], { from: accounts[0] });
    console.log("distribute amount after : ", whitelistAfter.distributedAmount);
  });
});
