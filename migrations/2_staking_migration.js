//** LFG Migration Script */
//** Author Alex Hong : LFG NFT Platform 2021.9 */

require("dotenv").config();

const LFGToken = artifacts.require("LFGToken");
const GamersePool = artifacts.require("GamersePool");
module.exports = async function (deployer, network, accounts) {
  /** migrate LFG token to the network */
  await deployer.deploy(LFGToken, "LFG", "LFG", "1000000000000000000000000000", { from: accounts[0] });

  const tokenInst = await LFGToken.deployed();

  console.log("tokenInst address ", tokenInst.address);

  /** migrate LFG Vesting contract to network */
  await deployer.deploy(GamersePool,
    tokenInst.address,//"0xcf8592c37dbc87f600648a26cf0c49a7ad788a32", //"0xcE47357b9B1eE25e24302227e162c902143E2aAb", // _stakedToken
    tokenInst.address,//"0xcf8592c37dbc87f600648a26cf0c49a7ad788a32", //"0xcE47357b9B1eE25e24302227e162c902143E2aAb", // _rewardToken
    accounts[8], //"0x3ca3822163D049364E67bE19a0D3B2F03B7e99b5", // _rewardHolder
    accounts[9], //"0xf197c5bC13383ef49511303065d39b33DC063f72", // _custodyAddress
    "3088564589600000000",                         // _rewardPerBlock
    15688033,                                    // _startBlock
    18278233,                                    // _bonusEndBlock
    5000,                                        // _penaltyFee
    2592000,                                     // _penaltyDuration
    "10000000000000000000000",                     // _adMinStakeAmount
    3600 * 24 * 80                               // _adDuration
  );

  // // /** get instance of deployed LFGVesting contract */
  // const poolInst = await LFGMasterChef.deployed();
};
