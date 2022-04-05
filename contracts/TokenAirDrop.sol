// SPDX-License-Identifier: MIT

//** LFG Vesting Contract */
//** Author Xiao Shengguang : LFG Airdrop Contract 2022.3 */

pragma solidity 0.6.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract TokenAirDrop is Ownable {

    using SafeERC20 for IERC20;

    event AirDrop(address recipient, uint256 amount);

    IERC20 public lfgToken;

    constructor(address _owner, IERC20 _token) public {
        require(_owner != address(0), "Invalid address");
        transferOwnership(_owner);
        lfgToken = _token;
    }

    /**
     *
     * @dev set LFG token address for contract
     *
     * @param {_token} address of IERC20 instance
     * @return {bool} return status of token address
     *
     */
    function setLFGToken(IERC20 _token) external onlyOwner returns (bool) {
        lfgToken = _token;
        return true;
    }

    /*
    Airdrop function which take up a array of address, indvidual token amount
   */
    function airDrop(address[] memory _recipients, uint256[] memory _amounts)
        public
        onlyOwner
        returns (bool)
    {
        require(_recipients.length == _amounts.length);
        for (uint256 i = 0; i < _amounts.length; i++) {
            lfgToken.safeTransfer(_recipients[i], _amounts[i]);

            emit AirDrop(_recipients[i], _amounts[i]);
        }
        return true;
    }
}
