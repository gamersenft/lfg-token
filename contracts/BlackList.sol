// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";

contract BPBlack is Ownable {
    mapping(address => bool) public blacklist;

    address public manager;

    modifier onlyManager() {
        require(msg.sender == manager, "Only manager can execute");
    }

    event ManagerUpdated(address manager);
    event AddedToBlacklist(address account);
    event RemovedFromBlacklist(address account);

    constructor(address _manager) {
        require(_manager != address(0), "Invalid manager");

        manager = _manager;
        emit ManagerUpdated(_manager);
    }

    function addToBlacklist(address _account) external onlyOwner {
        blacklist[_account] = true;
        emit AddedToBlacklist(_account);
    }

    function removeFromBlacklist(address _account) external onlyOwner {
        require(blacklist[_account], "Not in the blacklist");
        blacklist[_account] = false;
        emit RemovedFromBlacklist(_account);
    }

    function updateManager(address _manager) external onlyOwner {
        require(_manager != address(0), "Invalid manager");
        manager = _manager;
        emit ManagerUpdated(_manager);
    }

    function protect(
        address _from,
        address _to,
        uint256 _amount
    ) external onlyManager {
        require(!blacklist[_from], "Send address is blocked");
        require(!blacklist[_to], "Receiver address is blocked");
    }
}
