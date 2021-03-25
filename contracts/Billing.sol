// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

import './BillableAccounts.sol';
import './Treasury.sol';

contract Billing {
  Treasury companyTreasury;
  Treasury anyRateTreasury;
  BillableAccounts public billableAccounts;
  uint256 anyRateFee;

  string[] accounts;

  constructor(Treasury _companyTreasury, Treasury _anyRateTreasury, uint256 _anyRateFee) {
    companyTreasury = _companyTreasury;
    anyRateTreasury = _anyRateTreasury;
    anyRateFee = _anyRateFee;
  }

  function setBillableAccounts(address _billableAccounts) public {
    billableAccounts = BillableAccounts(_billableAccounts);
  }

  // TODO: figure out how much they owe

  function requestBill(string calldata account, uint256 payment, uint256 fee) public {
    billableAccounts.bill(account, payment, fee);
  }

  // collect from everyone
  // function billAll() public {
  //   for (uint i = 0; i < accounts.length; i++) {
  //   }
  // }
}