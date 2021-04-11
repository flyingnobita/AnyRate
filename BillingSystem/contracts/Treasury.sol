// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.6;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Treasury is Ownable {
    string public name;
    address private knownAddress;

    constructor(string memory _name) public {
        name = _name;
        knownAddress = msg.sender;
    }

    receive() external payable {}

    // Withdraw some value
    function transferTo(address payable to, uint256 value) onlyOwner external {
        require(msg.sender == knownAddress, 'Only a known address can initiate transfer');
        require(
            address(this).balance >= value,
            "You don't have enough liquidity to send"
        );

        to.transfer(value);
    }

    // Withdraw all value
    function withdrawAll() onlyOwner external {
        require(msg.sender == knownAddress, 'Only a known address can initiate withdrawal');
        payable(msg.sender).transfer(address(this).balance);
    }

    function updateKnownAddress() onlyOwner external {
        require(msg.sender == knownAddress, 'Only a known address can update the treasury');
        knownAddress = msg.sender;
    }
}
