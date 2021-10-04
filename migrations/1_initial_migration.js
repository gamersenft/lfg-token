//** LFG Migration Script */
//** Author Alex Hong : LFG NFT Platform 2021.9 */

require("dotenv").config();

const LFGToken = artifacts.require("LFGToken");
const LFGVesting = artifacts.require("LFGVesting");
const LFGMasterChef = artifacts.require("LFGMasterChef");
module.exports = async function (deployer, network, accounts) {
  /** migrate LFG token to the network */
  // await deployer.deploy(LFGToken, "LFG", "LFG", "1000000000000000000000000000", { from: accounts[0] });

  // /** migrate LFG Vesting contract to network */
  // await deployer.deploy(LFGVesting, { from: accounts[0] });

  // /** get instance of deployed LFGVesting contract */
  // const vestingInstance = await LFGVesting.deployed();

  // /** transfer ownership to initial deployer */
  // await vestingInstance.transferOwnership(accounts[0], { from: accounts[0] });

  // /** migrate LFG Vesting contract to network */
  await deployer.deploy(LFGMasterChef, { from: accounts[0] });

  // /** get instance of deployed LFGVesting contract */
  const chefInstance = await LFGMasterChef.deployed();

  // /** transfer ownership to initial deployer */
  // await chefInstance.transferOwnership(accounts[0], { from: accounts[0] });
};
