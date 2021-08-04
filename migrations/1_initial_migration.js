//** Artify Migration Script */
//** Author Alex Hong : Artify Crowfunding 2021.8 */

require("dotenv").config();

const ArtifyToken = artifacts.require("ArtifyToken");
const ArtifyVesting = artifacts.require("ArtifyVesting");
const ArtifyTempToken = artifacts.require("ArtifyTempToken");
module.exports = async function (deployer, network, accounts) {
  /** migrate Artify token to the network */
  // await deployer.deploy(ArtifyToken, "Artify", "ART", "1000000000000000000000000000", { from: accounts[0] });

  await deployer.deploy(ArtifyTempToken, "Artify", "ART", "1000000000000000000000000000", { from: accounts[0] });

  // /** migrate Artify Vesting contract to network */
  await deployer.deploy(ArtifyVesting, { from: accounts[0] });

  // /** get instance of deployed ArtifyVesting contract */
  const vestingInstance = await ArtifyVesting.deployed();

  // /** transfer ownership to initial deployer */
  await vestingInstance.transferOwnership(accounts[0], { from: accounts[0] });
};
