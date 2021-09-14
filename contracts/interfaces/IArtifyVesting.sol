// SPDX-License-Identifier: MIT

//** Artify Vesting Factory Contract */
//** Author Alex Hong : Artify Crowfunding 2021.8 */

pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IArtifyVesting {
    /**
     *
     * @dev this event will call when new token added to the contract
     * currently, we are supporting Artify token and this will be used for future implementation
     *
     */
    event AddToken(address token);

    /**
     *
     * @dev this event calls when new whitelist member joined to the pool
     *
     */
    event AddWhitelist(address wallet);

    /**
     *
     * @dev define vesting informations like x%, x months
     *
     */
    struct VestingInfo {
        uint256 strategy;
        uint256 cliff;
        uint256 start;
        uint256 duration;
        bool active;
    }

    /**
     *
     * @dev WhiteInfo is the struct type which store whitelist information
     *
     */
    struct WhitelistInfo {
        address wallet;
        uint256 artifyAmount;
        uint256 distributedAmount;
        uint256 joinDate;
        uint256 vestingOption;
        bool active;
    }

    /**
     *
     * inherit functions will be used in contract
     *
     */

    function setVestingInfo(
        uint256 _strategy,
        uint256 _cliff,
        uint256 _start,
        uint256 _duration
    ) external returns (bool);

    function addWhitelist(
        address _wallet,
        uint256 _artifyAmount,
        uint256 _option
    ) external returns (bool);

    function setArtifyToken(IERC20 _token) external returns (bool);

    function getArtifyToken() external view returns (address);

    function claimDistribution(address _wallet) external returns (bool);
}
