// SPDX-License-Identifier: MIT

//** LFG Vesting Factory Contract */
//** Author Alex Hong : LFG Platform 2021.9 */

pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ILFGVesting {
    /**
     *
     * @dev this event will call when new token added to the contract
     * currently, we are supporting LFG token and this will be used for future implementation
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
        uint256 lfgAmount;
        uint256 distributedAmount;
        uint256 joinDate;
        uint256 vestingOption;
        uint256 initUnlocked;
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

    function addWhitelists(
        address[] calldata _wallet,
        uint256[] calldata _lfgAmount,
        uint256[] calldata _option,
        uint256[] calldata _initAmount
    ) external returns (bool);

    function setLFGToken(IERC20 _token) external returns (bool);

    function getLFGToken() external view returns (address);

    function claimDistribution() external returns (bool);
}
