// SPDX-License-Identifier: MIT

//** LFG ERC20 TOKEN */
//** Author Xiao Shengguang : LFG Platform 2022.3 */

pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";

contract BPContractImpl is Ownable {
    mapping(address => bool) public backLists;

    constructor(address _owner) public {
        require(_owner != address(0), "Invalid owner address");
        transferOwnership(_owner);
    }

    function protect(
        address sender,
        address, /* receiver */
        uint256 /* amount */
    ) external view virtual {
        require(!backLists[sender], "Address is blocked");
    }

    function setBlacklist(address _addr, bool _blacklist) external onlyOwner {
        backLists[_addr] = _blacklist;
    }
}
