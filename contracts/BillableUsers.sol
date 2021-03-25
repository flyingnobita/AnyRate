// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

contract BillableUsers {
  address payable companyTreasury;
  address payable anyRateTreasury;

  mapping(address => uint256) public userBalances;

  constructor(address payable _companyTreasury, address payable _anyRateTreasury) {
    anyRateTreasury = _anyRateTreasury;
    companyTreasury = _companyTreasury;
  }

  function depositFrom(address from, uint256 value) payable {
    userBalances[from] += amount;
    event Receive(uint value);

    function () payable {
      Receive(msg.value);
    }
  }

  function withdrawTo(address from, address payable to, uint256 value) payable {
    require(this.balance > amount, 'There is not enough ether to withdraw');
    userBalances[from] -= amount;
    to.transfer(amount);
  }
}
