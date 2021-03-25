// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

contract BillableAccounts {
  address payable companyTreasury;
  address payable anyRateTreasury;
  address payable billingContract;

  event Deposit(address from, string to, uint256 value);
  event Transfer(string from, address to, uint256 value);
  event InsufficientFunds(string account, uint256 funds);

  mapping(string => uint256) public accountBalances; // Tracks who deposited how much value

  constructor(address payable _companyTreasury, address payable _anyRateTreasury, address payable _billingContract) {
    anyRateTreasury = _anyRateTreasury;
    companyTreasury = _companyTreasury;
    billingContract = _billingContract;
  }

  // Send value to this contract on behalf of an account
  function depositTo(string memory account) public payable {
    accountBalances[account] += msg.value;
    emit Deposit(msg.sender, account, msg.value);
  }

  // Message sender sends to treasuries
  function transferFrom(string memory account, address payable to, uint256 value) public {
    require(msg.sender == billingContract, 'Only the billing contract may withdraw');
    require(to == companyTreasury || to == anyRateTreasury, "You may only transfer to the contract's client or operator");
    if(accountBalances[account] >= value) {
      emit InsufficientFunds(account, accountBalances[account]);
    } else {
      accountBalances[account] -= value;
      to.transfer(value);
      emit Transfer(account, msg.sender, value);
    }
  }

  // Pay treasuries specified amounts
  function bill(string memory account, uint256 payment, uint256 fee) public {
    require(msg.sender == billingContract, 'Only the billing contract may withdraw');
    if(accountBalances[account] >= payment + fee) {
      emit InsufficientFunds(account, accountBalances[account]);
    } else {
      accountBalances[account] -= payment + fee;
      companyTreasury.transfer(payment);
      emit Transfer(account, companyTreasury, payment);
      anyRateTreasury.transfer(fee);
      emit Transfer(account, anyRateTreasury, fee);
    }
  }

  // Message sender sends to self
  function withdrawFrom(string memory account, uint256 value) public {
    require(msg.sender == billingContract, 'Only the billing contract may withdraw');
    require(accountBalances[account] >= value, 'There is not enough to withdraw');
    accountBalances[account] -= value;
    payable(msg.sender).transfer(value);
    emit Transfer(account, msg.sender, value);
  }
}
