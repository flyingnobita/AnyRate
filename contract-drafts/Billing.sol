// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

contract Billing {
  address companyTreasury;
  address anyRateTreasury;
  uint256 anyRateFee;

  mapping(string => address) usernames;

  constructor(address _companyTreasury, address _anyRateTreasury, uint256 _anyRateFee) {
    companyTreasury = _companyTreasury;
    anyRateTreasury = _anyRateTreasury;
    anyRateFee = _anyRateFee;
  }

  function bill() {
    for (uint i = 0; i < usernames.length; i++) {
      // figure out how much they owe
      // Call payout method on BillableUser contract
      companyTreasury.payout();
    }
  }
}