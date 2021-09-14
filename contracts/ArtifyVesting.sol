// SPDX-License-Identifier: MIT

//** Artify Vesting Contract */
//** Author Alex Hong : Artify Vesting Contract 2021.8 */

pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IArtifyVesting.sol";

contract ArtifyVesting is IArtifyVesting, Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /**
     *
     * @dev whitelistPools store all active whitelist members.
     *
     */
    mapping(address => WhitelistInfo) public whitelistPools;
    mapping(uint256 => VestingInfo) public vestingPools;

    IERC20 private _artifyToken;

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
        require(_strategy > 0, "Strategy should be correct");
        require(
            !vestingPools[_strategy].active,
            "Vesting option already exist"
        );

        vestingPools[_strategy].strategy = _strategy;
        vestingPools[_strategy].cliff = _start.add(_cliff);
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
    function getVestingInfo(uint256 _strategy)
        external
        view
        returns (VestingInfo memory)
    {
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
    function addWhitelist(
        address _wallet,
        uint256 _artifyAmount,
        uint256 _option
    ) external override onlyOwner returns (bool) {
        require(
            whitelistPools[_wallet].wallet != _wallet,
            "Whitelist already available"
        );
        require(vestingPools[_option].active, "Vesting option is not existing");

        whitelistPools[_wallet].wallet = _wallet;
        whitelistPools[_wallet].artifyAmount = _artifyAmount;
        whitelistPools[_wallet].distributedAmount = 0;
        whitelistPools[_wallet].joinDate = block.timestamp;
        whitelistPools[_wallet].vestingOption = _option;
        whitelistPools[_wallet].active = true;

        emit AddWhitelist(_wallet);

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
    function getWhitelist(address _wallet)
        external
        view
        returns (WhitelistInfo memory)
    {
        require(
            whitelistPools[_wallet].wallet == _wallet,
            "Whitelist is not existing"
        );

        return whitelistPools[_wallet];
    }

    /**
     *
     * @dev set artify token address for contract
     *
     * @param {_token} address of IERC20 instance
     * @return {bool} return status of token address
     *
     */
    function setArtifyToken(IERC20 _token)
        external
        override
        onlyOwner
        returns (bool)
    {
        _artifyToken = _token;
        return true;
    }

    /**
     *
     * @dev getter function for deployed artify token address
     *
     * @return {address} return deployment address of artify token
     *
     */
    function getArtifyToken() external view override returns (address) {
        return address(_artifyToken);
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
    function claimDistribution(address _wallet)
        external
        override
        nonReentrant
        returns (bool)
    {
        require(whitelistPools[_wallet].active, "User is not in whitelist");

        uint256 releaseAmount = calculateReleasableAmount(_wallet);
        if (releaseAmount > 0) {
            _artifyToken.transfer(_wallet, releaseAmount);
            whitelistPools[_wallet].distributedAmount += releaseAmount;
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
    function calculateReleasableAmount(address _wallet)
        public
        view
        returns (uint256)
    {
        return
            calculateVestAmount(_wallet).sub(
                whitelistPools[_wallet].distributedAmount
            );
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
    function calculateVestAmount(address _wallet)
        public
        view
        returns (uint256)
    {
        if (now < vestingPools[whitelistPools[_wallet].vestingOption].cliff) {
            return 0;
        } else if (
            now >=
            vestingPools[whitelistPools[_wallet].vestingOption].start.add(
                vestingPools[whitelistPools[_wallet].vestingOption].duration
            )
        ) {
            return whitelistPools[_wallet].artifyAmount;
        } else {
            return
                whitelistPools[_wallet]
                    .artifyAmount
                    .mul(
                        now.sub(
                            vestingPools[whitelistPools[_wallet].vestingOption]
                                .start
                        )
                    )
                    .div(
                        vestingPools[whitelistPools[_wallet].vestingOption]
                            .duration
                    );
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
