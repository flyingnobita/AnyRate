// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import './Treasury.sol';
import "hardhat/console.sol";

contract Billing is Ownable {
  address payable clientTreasury;
  address payable anyRateTreasury;
  uint64 public anyRateFee; // Reciprocal of rate expressed as a decimal -- this float math must be done off-chain
  uint64 public costPerUnit; // Same format as anyRateFee

  mapping(string => uint256) public accountBalances; // Tracks who deposited how much value

  event Deposit(address from, string to, uint256 value);
  event Transfer(string from, address to, uint256 value);
  event InsufficientFunds(string account, uint256 funds);

  constructor(address payable _clientTreasury, address payable _anyRateTreasury, uint64 _anyRateFee) public {
    clientTreasury = _clientTreasury;
    anyRateTreasury = _anyRateTreasury;
    anyRateFee = _anyRateFee;
  }

  // chainlink method gets data from oracle contract
  // calls back a method that will bill users
  // provides usage per user for <time period>
      // frequency of calling the oracle is set in configuration during sign up, and updateable
  function callChainlink() public {
    // Jan to implement this
  }

  // public or external?
  function usageCallback(string[] memory accounts, uint64[] memory usages) public {
    // iterate over accountUsage and bill each one
    // iterate over accountUsage while deducting from each account, but send payouts in 2 large transactions
      // risk of this? what if aborted? revert safe?
  }

  /////
  // AnyRate

  function setAnyRateTreasury(address payable treasury) public {
    // how to verify this address is of the correct type?
    anyRateTreasury = treasury;
  }
  function setFee(uint64 _anyRateFee) public {
    anyRateFee = _anyRateFee;
  }

  /////
  // Client Business

  function setBusinessTreasury(address payable treasury) public {
    // how to verify this address is of the correct type?
    clientTreasury = treasury;
  }
  function setCostPerUnit(uint64 _costPerUnit) public {
    costPerUnit = _costPerUnit;
  }

  /////
  // User Accounts

  // Send value to this contract on behalf of an account
  function depositTo(string memory account) public payable {
    accountBalances[account] += msg.value;
    emit Deposit(msg.sender, account, msg.value);
  }

  /////
  // Billing

  // Figure out how much is owed each party
  function calculatePayment(uint64 usage) internal view
  returns (uint128 payment) {
    payment = usage / costPerUnit;
  }
  function calculateFee(uint128 payment) internal view
  returns (uint256 fee) {
    fee = payment / anyRateFee;
  }

  // Pay treasuries specified amounts
  function bill(string memory account, uint128 payment, uint256 fee) public {
    // require(msg.sender == address(this), 'Only the billing contract may bill users');
    if(accountBalances[account] < (payment + fee)) {
      emit InsufficientFunds(account, accountBalances[account]);
    } else {
      accountBalances[account] -= (payment + fee);
      clientTreasury.transfer(payment);
      emit Transfer(account, clientTreasury, payment);
      anyRateTreasury.transfer(fee);
      emit Transfer(account, anyRateTreasury, fee);
    }
  }

  // collect from everyone
  // call this inside the callback from the oracle for cleaner code?
  // function billAll() public {
  //   for (uint i = 0; i < accountBalances.length; i++) {
  //     uint128 payment = this.calculatePayment(usage);
  //     uint256 fee = this.calculateFee(payment);
  //     this.bill(accounts[i], payment, fee);
  //   }
  // }
}