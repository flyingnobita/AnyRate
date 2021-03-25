// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

// Belongs to either Business or AnyRate itself
contract Treasury {
  address payable owner;

  constructor(address payable _owner) {
    owner = _owner;
  }

  function withdrawTo(address payable to, uint256 value) public {
    require(msg.sender == owner, 'Only the treasury owner can call this function');
    require(address(this).balance >= value, "You don't have enough liquidity to send");

    to.transfer(value);
  }
}
