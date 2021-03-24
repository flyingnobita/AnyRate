// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.6;

contract BillableUsers {
  address companyTreasury;
  address anyRateTreasury;

  mapping(address => uint256) public userBalances;

  constructor(address _companyTreasury, address _anyRateTreasury) {
    anyRateTreasury = _anyRateTreasury;
    companyTreasury = _companyTreasury;
  }

  function depositFrom(address from, uint256 amount) public {
    userBalances[user] += amount;
  }

  function withdrawTo(address to, uint256 amount) public {
    require(this.balance > amount, 'There is not enough ether to withdraw');
    userBalances[user] -= amount;
  }
}
