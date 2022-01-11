// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./libs/SafeBEP20.sol";

contract GamersePool is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    // Accrued token per share
    uint256 public accTokenPerShare;

    // The block number when GAMERSE mining ends.
    uint256 public bonusEndBlock;

    // The block number when GAMERSE mining starts.
    uint256 public startBlock;

    // The block number of the last pool update
    uint256 public lastRewardBlock;

    // GAMERSE tokens created per block.
    uint256 public rewardPerBlock;

    // The precision factor
    uint256 public PRECISION_FACTOR;

    // The reward token
    IBEP20 public rewardToken;

    // The staked token
    IBEP20 public stakedToken;

    // Max penalty fee: 50%
    uint256 public constant MAXIMUM_PENALTY_FEE = 5000;

    // Max penalty duration: 14 days
    uint256 public constant MAXIMUM_PENALTY_DURATION = 30 days;

    // Max airdrop staking duration
    uint256 public constant MAXIMUM_AIRDROP_DURATION = 85 * 28780;

    // Default max staking amount per account
    uint256 public constant DEFAULT_MAX_STAKING_AMOUNT = 500000000000000000000000;

    // Penalty Fee
    uint256 public penaltyFee;

    // Penalty Duration
    uint256 public penaltyDuration;

    // Reward Holder address
    address public rewardHolder;

    // custody address
    address public custodyAddress;

    // airdrop NFT minimum staking amount
    uint256 public adMinStakeAmount;

    // duration in blocks needed for airdrop
    uint256 public adDuration;

    // maximum staking amount per user
    uint256 public maxStakeAmount;

    // Total staked amount of all user
    uint256 public totalStakedAmount;

    // Info of each user that stakes tokens (stakedToken)
    mapping(address => UserInfo) public userInfo;

    struct UserInfo {
        uint256 amount; // How many staked tokens the user has provided
        uint256 rewardDebt; // Reward debt
        uint256 rewardDeposit; // Reward from deposits
        uint256 penaltyUntil; //When can the user withdraw without penalty
        uint256 lastDeposit; // When user deposit last time
        uint256 adStartBlock; // When user started to take part in airdrop by staking adMinStakeAmount
    }

    event AdminTokenRecovery(address tokenRecovered, uint256 amount);
    event Deposit(address indexed user, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 amount);
    event NewStartAndEndBlocks(uint256 startBlock, uint256 endBlock);
    event NewRewardPerBlock(uint256 rewardPerBlock);
    event RewardsStop(uint256 blockNumber);
    event Withdraw(address indexed user, uint256 amount);
    event NewPenaltyFee(uint256 fee);
    event NewPenaltyDuration(uint256 fee);
    event RewardClaimed(address indexed account, uint256 amount);
    event RewardPenalized(address indexed account, uint256 amount);

    constructor(
        IBEP20 _stakedToken,
        IBEP20 _rewardToken,
        address _rewardHolder,
        address _custodyAddress,
        uint256 _rewardPerBlock,
        uint256 _startBlock,
        uint256 _bonusEndBlock,
        uint256 _penaltyFee,
        uint256 _penaltyDuration,
        uint256 _adMinStakeAmount,
        uint256 _adDuration
    ) public {
        require(_penaltyFee <= MAXIMUM_PENALTY_FEE, "Invalid penalty fee");
        require(_penaltyDuration <= MAXIMUM_PENALTY_DURATION, "Invalid penalty duration");
        require(_custodyAddress != address(0), "Invalid custody address");
        require(_adDuration <= MAXIMUM_AIRDROP_DURATION, "Invalid airdrop duration");

        stakedToken = _stakedToken;
        rewardToken = _rewardToken;
        rewardPerBlock = _rewardPerBlock;
        startBlock = _startBlock;
        bonusEndBlock = _bonusEndBlock;
        penaltyFee = _penaltyFee;
        penaltyDuration = _penaltyDuration;
        rewardHolder = _rewardHolder;
        custodyAddress = _custodyAddress;
        adMinStakeAmount = _adMinStakeAmount;
        adDuration = _adDuration;
        maxStakeAmount = DEFAULT_MAX_STAKING_AMOUNT;

        uint256 decimalsRewardToken = uint256(rewardToken.decimals());
        require(decimalsRewardToken < 30, "Must be inferior to 30");

        PRECISION_FACTOR = uint256(10**(uint256(30).sub(decimalsRewardToken)));

        // Set the lastRewardBlock as the startBlock
        lastRewardBlock = startBlock;
    }

    /*
     * @notice Deposit staked tokens and collect reward tokens (if any)
     * @param _amount: amount to withdraw (in rewardToken)
     */
    function deposit(uint256 _amount) external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        require(
            user.amount.add(_amount) <= maxStakeAmount,
            "Total amount exceeds max staking amount per user"
        );

        _updatePool();

        uint256 pending = user.amount.mul(accTokenPerShare).div(PRECISION_FACTOR).sub(
            user.rewardDebt
        );

        if (pending != 0) {
            user.rewardDeposit = user.rewardDeposit.add(pending);
        }

        if (_amount != 0) {
            stakedToken.safeTransferFrom(address(msg.sender), address(this), _amount);
            user.amount = user.amount.add(_amount);
            user.lastDeposit = block.timestamp;
            totalStakedAmount = totalStakedAmount.add(_amount);

            if (user.penaltyUntil == 0) {
                user.penaltyUntil = block.timestamp.add(penaltyDuration);
            }
        }

        _updateAirdrop();

        user.rewardDebt = user.amount.mul(accTokenPerShare).div(PRECISION_FACTOR);

        emit Deposit(msg.sender, _amount);
    }

    /*
     * @notice Withdraw staked tokens and collect reward tokens
     * @param _amount: amount to withdraw (in rewardToken)
     */
    function withdraw(uint256 _amount) external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        require(user.amount >= _amount, "Amount to withdraw too high");

        _updatePool();

        uint256 pending = user
            .amount
            .mul(accTokenPerShare)
            .div(PRECISION_FACTOR)
            .sub(user.rewardDebt)
            .add(user.rewardDeposit);

        if (_amount != 0) {
            user.amount = user.amount.sub(_amount);
            stakedToken.safeTransfer(address(msg.sender), _amount);
            totalStakedAmount = totalStakedAmount.sub(_amount);
        }

        if (pending != 0) {
            if (block.timestamp < user.penaltyUntil) {
                uint256 penaltyAmount = pending.mul(penaltyFee).div(10000);
                rewardToken.safeTransferFrom(rewardHolder, custodyAddress, penaltyAmount);
                emit RewardPenalized(msg.sender, penaltyAmount);

                rewardToken.safeTransferFrom(
                    rewardHolder,
                    address(msg.sender),
                    pending.sub(penaltyAmount)
                );
                emit RewardClaimed(msg.sender, pending.sub(penaltyAmount));
            } else {
                rewardToken.safeTransferFrom(rewardHolder, address(msg.sender), pending);
                emit RewardClaimed(msg.sender, pending);
            }
            user.rewardDeposit = 0;
        }

        _updateAirdrop();

        user.rewardDebt = user.amount.mul(accTokenPerShare).div(PRECISION_FACTOR);

        emit Withdraw(msg.sender, _amount);
    }

    /*
     * @notice Withdraw staked tokens without caring about rewards rewards
     * @dev Needs to be for emergency.
     */
    function emergencyWithdraw() external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];

        uint256 amountToTransfer = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;
        user.penaltyUntil = 0;
        user.lastDeposit = 0;
        user.rewardDeposit = 0;
        user.adStartBlock = 0;

        if (amountToTransfer != 0) {
            stakedToken.safeTransfer(address(msg.sender), amountToTransfer);
            emit EmergencyWithdraw(msg.sender, amountToTransfer);
            totalStakedAmount = totalStakedAmount.sub(amountToTransfer);
        }
    }

    /**
     * @notice It allows the admin to recover wrong tokens sent to the contract
     * @param _tokenAddress: the address of the token to withdraw
     * @param _tokenAmount: the number of tokens to withdraw
     * @dev This function is only callable by admin.
     */
    function recoverWrongTokens(address _tokenAddress, uint256 _tokenAmount) external onlyOwner {
        require(_tokenAddress != address(stakedToken), "Cannot be staked token");
        require(_tokenAddress != address(rewardToken), "Cannot be reward token");

        IBEP20(_tokenAddress).safeTransfer(address(msg.sender), _tokenAmount);

        emit AdminTokenRecovery(_tokenAddress, _tokenAmount);
    }

    /**
     * @notice It allows the admin to update start and end blocks
     * @dev This function is only callable by owner.
     * @param _startBlock: the new start block
     * @param _bonusEndBlock: the new end block
     */
    function updateStartAndEndBlocks(uint256 _startBlock, uint256 _bonusEndBlock)
        external
        onlyOwner
    {
        require(startBlock < _startBlock, "New startBlock must be bigger than previous one");
        require(_startBlock < _bonusEndBlock, "New startBlock must be lower than new endBlock");
        require(block.number < _startBlock, "New startBlock must be higher than current block");

        _updatePool();

        startBlock = _startBlock;
        bonusEndBlock = _bonusEndBlock;

        // Set the lastRewardBlock as the startBlock
        lastRewardBlock = startBlock;

        emit NewStartAndEndBlocks(_startBlock, _bonusEndBlock);
    }

    /*
     * @notice Update the penalty fee
     * @dev Only callable by owner.
     * @param _fee: the penalty fee
     */
    function updatePenaltyFee(uint256 _fee) external onlyOwner {
        require(_fee <= MAXIMUM_PENALTY_FEE, "Invalid penalty fee");
        penaltyFee = _fee;
        emit NewPenaltyFee(_fee);
    }

    /*
     * @notice Update the penalty duration
     * @dev Only callable by owner.
     * @param _duration: the penalty duration in seconds
     */
    function updatePenaltyDuration(uint256 _duration) external onlyOwner {
        require(_duration <= MAXIMUM_PENALTY_DURATION, "Invalid penalty duration");
        penaltyDuration = _duration;
        emit NewPenaltyDuration(_duration);
    }

    /*
     * @notice Update the custody address
     * @dev Only callable by owner.
     * @param _account: custody address
     */
    function updateCustodyAddress(address _account) external onlyOwner {
        require(_account != address(0), "Invalid address");
        custodyAddress = _account;
    }

    /*
     * @notice View function to see pending reward on frontend.
     * @param _user: user address
     * @return Pending reward for a given user
     */
    function pendingReward(address _user) external view returns (uint256) {
        UserInfo storage user = userInfo[_user];
        if (block.number > lastRewardBlock && totalStakedAmount != 0) {
            uint256 multiplier = _getMultiplier(lastRewardBlock, block.number);
            uint256 cakeReward = multiplier.mul(rewardPerBlock);
            uint256 adjustedTokenPerShare = accTokenPerShare.add(
                cakeReward.mul(PRECISION_FACTOR).div(totalStakedAmount)
            );
            return
                user
                    .amount
                    .mul(adjustedTokenPerShare)
                    .div(PRECISION_FACTOR)
                    .sub(user.rewardDebt)
                    .add(user.rewardDeposit);
        } else {
            return
                user.amount.mul(accTokenPerShare).div(PRECISION_FACTOR).sub(user.rewardDebt).add(
                    user.rewardDeposit
                );
        }
    }

    /*
     * @notice Update reward variables of the given pool to be up-to-date.
     */
    function _updatePool() internal {
        if (block.number <= lastRewardBlock) {
            return;
        }

        if (totalStakedAmount == 0) {
            lastRewardBlock = block.number;
            return;
        }

        uint256 multiplier = _getMultiplier(lastRewardBlock, block.number);
        uint256 cakeReward = multiplier.mul(rewardPerBlock);
        accTokenPerShare = accTokenPerShare.add(
            cakeReward.mul(PRECISION_FACTOR).div(totalStakedAmount)
        );
        lastRewardBlock = block.number;
    }

    /*
     * @notice Update user's airdrop information
     */
    function _updateAirdrop() internal {
        if (bonusEndBlock < block.number) {
            return;
        }

        UserInfo storage user = userInfo[msg.sender];

        if (user.amount < adMinStakeAmount) {
            user.adStartBlock = 0;
            return;
        }

        if (
            user.amount >= adMinStakeAmount &&
            user.adStartBlock == 0 &&
            block.number.add(adDuration) <= bonusEndBlock
        ) {
            user.adStartBlock = block.number;
        }
    }

    /*
     * @notice Return reward multiplier over the given _from to _to block.
     * @param _from: block to start
     * @param _to: block to finish
     */
    function _getMultiplier(uint256 _from, uint256 _to) internal view returns (uint256) {
        if (_to <= bonusEndBlock) {
            return _to.sub(_from);
        } else if (_from >= bonusEndBlock) {
            return 0;
        } else {
            return bonusEndBlock.sub(_from);
        }
    }

    /*
     * @notice Update the maximum staking amount per user
     * @dev Only callable by owner.
     * @param amount: the new maximum staking amount per user
     */
    function updateMaxStakeAmount(uint256 amount) external onlyOwner {
        maxStakeAmount = amount;
    }
}
