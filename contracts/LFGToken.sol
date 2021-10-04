// SPDX-License-Identifier: MIT

//** LFG ERC20 TOKEN */
//** Author Alex Hong : LFG NFT Platform 2021.9 */

pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LFGToken is ERC20, Ownable {
    using SafeMath for uint256;

    address public constant DEAD_ADDRESS =
        0x000000000000000000000000000000000000dEaD;

    /**
     *
     * @dev mint initialSupply in constructor with symbol and name
     *
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) public ERC20(name, symbol) {
        _mint(_msgSender(), initialSupply);
    }

    /**
     *
     * @dev lock tokens by sending to DEAD address
     *
     */
    function lockTokens(uint256 amount) external onlyOwner returns (bool) {
        _transfer(_msgSender(), DEAD_ADDRESS, amount);
        return true;
    }

    /**
     * @dev Destroys `amount` tokens from the caller.
     *
     * See {ERC20-_burn}.
     */
    function burn(uint256 amount) external onlyOwner returns (bool) {
        _burn(_msgSender(), amount);
        return true;
    }
}
