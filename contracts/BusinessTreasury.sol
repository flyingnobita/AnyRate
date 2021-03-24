// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.6;

// Belongs to either Business or AnyRate itself
contract Treasury {
  address public owner;

  constructor(address _owner) {
    owner = _owner;
  }

  function withdrawTo(address to, uint256 amount) {

  }
}
