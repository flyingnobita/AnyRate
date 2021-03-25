// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

import './BillableAccounts.sol';
import './Treasury.sol';

contract Billing {
  Treasury companyTreasury;
  Treasury anyRateTreasury;
  BillableAccounts billableAccounts;
  uint256 anyRateFee;

  string[] accounts;

  constructor(Treasury _companyTreasury, Treasury _anyRateTreasury, BillableAccounts _billableAccounts, uint256 _anyRateFee) {
    companyTreasury = _companyTreasury;
    anyRateTreasury = _anyRateTreasury;
    billableAccounts = _billableAccounts;
    anyRateFee = _anyRateFee;
  }

  // TODO: figure out how much they owe

  function requestBill(string memory account, uint256 payment, uint256 fee) public {
    billableAccounts.bill(account, payment, fee);
  }

  // collect from everyone
  // function billAll() public {
  //   for (uint i = 0; i < accounts.length; i++) {
  //   }
  // }
}