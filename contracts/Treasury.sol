// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

contract Treasury {
  address owner; // Belongs to business or AnyRate

  constructor(address _owner) {
    owner = _owner;
  }

  // Withdraw some value
  function transferTo(address payable to, uint256 value) public {
    require(msg.sender == owner, 'Only the treasury owner can call this function');
    require(address(this).balance >= value, "You don't have enough liquidity to send");

    to.transfer(value);
  }

  // Withdraw all value
  function withdrawAll() public {
    require(msg.sender == owner, 'Only the treasury owner can call this function');

    payable(msg.sender).transfer(address(this).balance);
  }
}
