// SPDX-License-Identifier: MIT

//** LFG Vesting Contract */
//** Author Alex Hong : LFG Vesting Contract 2021.9 */

pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/ILFGVesting.sol";

contract LFGVesting is ILFGVesting, Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /**
     *
     * @dev whitelistPools store all active whitelist members.
     *
     */
    mapping(address => WhitelistInfo) public whitelistPools;
    mapping(uint256 => VestingInfo) public vestingPools;

    IERC20 private _lfgToken;

    /**
     *
     * @dev setup vesting plans for investors
     *
     * @param {uint256} indicate the distribution plan - seed, strategic and private
     * @param {uint256} duration in seconds of the cliff in which tokens will begin to vest
     * @param {uint256} vesting start date
     * @param {uint256} duration in seconds of the period in which the tokens will vest
     *
     * @return {bool} status of the updating vesting plan
     *
     */
    function setVestingInfo(
        uint256 _strategy,
        uint256 _cliff,
        uint256 _start,
        uint256 _duration
    ) external override onlyOwner returns (bool) {
        require(_strategy != 0, "Strategy should be correct");
        require(!vestingPools[_strategy].active, "Vesting option already exist");

        vestingPools[_strategy].strategy = _strategy;
        vestingPools[_strategy].cliff = _start.add(_cliff * 1 days);
        vestingPools[_strategy].start = _start;
        vestingPools[_strategy].duration = _duration;
        vestingPools[_strategy].active = true;

        return true;
    }

    /**
     *
     * @dev get vesting info
     *
     * @param {uint256} strategy of vesting info
     *
     * @return return vesting strategy
     *
     */
    function getVestingInfo(uint256 _strategy) external view returns (VestingInfo memory) {
        require(vestingPools[_strategy].active, "Vesting option is not exist");

        return vestingPools[_strategy];
    }

    /**
     *
     * @dev set the address as whitelist user address
     *
     * @param {address} address of the user
     *
     * @return {bool} return status of the whitelist
     *
     */
    function addWhitelists(
        address[] calldata _wallet,
        uint256[] calldata _lfgAmount,
        uint256[] calldata _option,
        uint256[] calldata _initUnlocked
    ) external override onlyOwner returns (bool) {
        require(_wallet.length == _lfgAmount.length, "Invalid array length");
        require(_option.length == _lfgAmount.length, "Invalid array length");
        require(_initUnlocked.length == _lfgAmount.length, "Invalid array length");

        for (uint256 i = 0; i < _wallet.length; i++) {
            require(whitelistPools[_wallet[i]].wallet != _wallet[i], "Whitelist already available");
            require(vestingPools[_option[i]].active, "Vesting option is not existing");
            require(_initUnlocked[i] <= _lfgAmount[i], "Invalid init amount");

            whitelistPools[_wallet[i]].wallet = _wallet[i];
            whitelistPools[_wallet[i]].lfgAmount = _lfgAmount[i].sub(_initUnlocked[i]);
            whitelistPools[_wallet[i]].distributedAmount = 0;
            whitelistPools[_wallet[i]].joinDate = block.timestamp;
            whitelistPools[_wallet[i]].vestingOption = _option[i];
            whitelistPools[_wallet[i]].active = true;
            whitelistPools[_wallet[i]].initUnlocked = _initUnlocked[i];

            if (_initUnlocked[i] != 0) {
                _lfgToken.safeTransfer(_wallet[i], _initUnlocked[i]);
            }

            emit AddWhitelist(_wallet[i]);
        }

        return true;
    }

    /**
     *
     * @dev set the address as whitelist user address
     *
     * @param {address} address of the user
     *
     * @return {Whitelist} return whitelist instance
     *
     */
    function getWhitelist(address _wallet) external view returns (WhitelistInfo memory) {
        require(whitelistPools[_wallet].wallet == _wallet, "Whitelist is not existing");

        return whitelistPools[_wallet];
    }

    /**
     *
     * @dev set LFG token address for contract
     *
     * @param {_token} address of IERC20 instance
     * @return {bool} return status of token address
     *
     */
    function setLFGToken(IERC20 _token) external override onlyOwner returns (bool) {
        _lfgToken = _token;
        return true;
    }

    /**
     *
     * @dev getter function for deployed lfg token address
     *
     * @return {address} return deployment address of lfg token
     *
     */
    function getLFGToken() external view override returns (address) {
        return address(_lfgToken);
    }

    /**
     *
     * @dev distribute the token to the investors
     *
     * @param {address} wallet address of the investor
     *
     * @return {bool} return status of distribution
     *
     */
    function claimDistribution() external override nonReentrant returns (bool) {
        require(whitelistPools[msg.sender].active, "User is not in whitelist");

        uint256 releaseAmount = calculateReleasableAmount(msg.sender);
        if (releaseAmount > 0) {
            _lfgToken.safeTransfer(msg.sender, releaseAmount);
            whitelistPools[msg.sender].distributedAmount = whitelistPools[msg.sender]
                .distributedAmount
                .add(releaseAmount);
        } else {
            return false;
        }

        return true;
    }

    /**
     *
     * @dev calculate releasable amount by subtracting distributed amount
     *
     * @param {address} investor wallet address
     *
     * @return {uint256} releasable amount of the whitelist
     *
     */
    function calculateReleasableAmount(address _wallet) public view returns (uint256) {
        return calculateVestAmount(_wallet).sub(whitelistPools[_wallet].distributedAmount);
    }

    /**
     *
     * @dev calculate the total vested amount by the time
     *
     * @param {address} user wallet address
     *
     * @return {uint256} return vested amount
     *
     */
    function calculateVestAmount(address _wallet) public view returns (uint256) {
        if (block.timestamp < vestingPools[whitelistPools[_wallet].vestingOption].cliff) {
            return 0;
        } else if (
            block.timestamp >=
            vestingPools[whitelistPools[_wallet].vestingOption].start.add(
                vestingPools[whitelistPools[_wallet].vestingOption].duration * 1 days
            )
        ) {
            return whitelistPools[_wallet].lfgAmount;
        } else {
            return
                whitelistPools[_wallet]
                    .lfgAmount
                    .mul(
                        block.timestamp.sub(
                            vestingPools[whitelistPools[_wallet].vestingOption].start
                        )
                    )
                    .div(vestingPools[whitelistPools[_wallet].vestingOption].duration * 1 days);
        }
    }

    /**
     *
     * @dev Retrieve total amount of token from the contract
     *
     * @param {address} address of the token
     *
     * @return {uint256} total amount of token
     *
     */
    function getTotalToken(IERC20 _token) external view returns (uint256) {
        return _token.balanceOf(address(this));
    }
}
