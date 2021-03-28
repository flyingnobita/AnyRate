// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import './Treasury.sol';

contract Billing is Ownable {
  address payable clientTreasury;
  address payable anyRateTreasury;
  uint64 public anyRateFee; // between 0.00 and 1.00 in regular decimal
  uint64 public costPerUnit; // greater than 0

  mapping(bytes32 => uint256) public accountBalances; // Tracks who deposited how much value

  event Deposit(address from, bytes32 to, uint256 value);
  event Transfer(bytes32 from, address to, uint256 value);
  event InsufficientFunds(bytes32 account, uint256 funds);

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
  function usageCallback(bytes32[] memory accounts, uint64[] memory usages) public {
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
  function depositTo(bytes32 account) public payable {
    accountBalances[account] += msg.value;
    emit Deposit(msg.sender, account, msg.value);
  }

  /////
  // Billing

  // Figure out how much is owed each party
  function calculatePayment(uint64 usage) internal view
  returns (uint128 payment) {
    payment = usage * costPerUnit;
  }
  function calculateFee(uint128 payment) internal view
  returns (uint256 fee) {
    fee = payment / anyRateFee;
  }

  // Pay treasuries specified amounts
  function bill(bytes32 account, uint128 payment, uint256 fee) public {
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