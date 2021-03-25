// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

import './Treasury.sol';

contract Billing {
  Treasury clientTreasury;
  Treasury anyRateTreasury;
  uint256 public anyRateFee;
  uint256 public costPerUnit;

  mapping(string => uint256) public accountBalances; // Tracks who deposited how much value

  event Deposit(address from, string to, uint256 value);
  event Transfer(string from, address to, uint256 value);
  event InsufficientFunds(string account, uint256 funds);

  constructor(Treasury _clientTreasury, Treasury _anyRateTreasury, uint256 _anyRateFee) {
    clientTreasury = _clientTreasury;
    anyRateTreasury = _anyRateTreasury;
    anyRateFee = _anyRateFee;
  }

  // chainlink method gets data from oracle contract
  // calls back a method that will bill users
  // provides usage per user for <time period>
      // frequency of calling the oracle is set in configuration during sign up, and updateable


  // public or external?
  function usageCallback(mapping(string => uint256) memory accountUsage) public {
    // iterate over accountUsage and bill each one
    // iterate over accountUsage while deducting from each account, but send payouts in 2 large transactions
      // risk of this? what if aborted? revert safe?
  }

  function setBusinessTreasury(address _treasury) public {
    // how to verify this address is of the correct type?
    clientTreasury = Treasury(_treasury);
  }

  function setAnyRateTreasury(address _treasury) public {
    // how to verify this address is of the correct type?
    anyRateTreasury = Treasury(_treasury);
  }

  function setFee(uint256 _anyRateFee) public {
    anyRateFee = _anyRateFee;
  }

   // Send value to this contract on behalf of an account
  function depositTo(string memory account) public payable {
    accountBalances[account] += msg.value;
    emit Deposit(msg.sender, account, msg.value);
  }

  // TODO: figure out how much they owe

  // Pay treasuries specified amounts
  function bill(string memory account, uint256 payment, uint256 fee) public {
    require(msg.sender == address(this), 'Only the billing contract may bill users');
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
  //     // uint256 fee = this.calculateFee(payment)
  //     // this.bill(accounts[i], 10, 1);
  //   }
  // }
}