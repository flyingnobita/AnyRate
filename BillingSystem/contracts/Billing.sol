// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import './Treasury.sol';
import "hardhat/console.sol";

contract Billing is Ownable {
  address payable clientTreasury;
  address payable anyRateTreasury;
  uint256 public anyRateFee; // Reciprocal of rate expressed as a decimal -- this float math must be done off-chain
  uint256 public costPerUnit; // Same format as anyRateFee

  mapping(string => uint256) public accountBalances; // Tracks who deposited how much value

  event Deposit(address from, string to, uint256 value);
  event PayBill(string from, address to, uint256 value);
  event InsufficientFunds(string account, uint256 funds);

  constructor(address payable _clientTreasury, address payable _anyRateTreasury, uint256 _anyRateFee, uint256 _costPerUnit) public {
    clientTreasury = _clientTreasury;
    anyRateTreasury = _anyRateTreasury;
    anyRateFee = _anyRateFee;
    costPerUnit = _costPerUnit;
  }

  receive() external payable {}

  // chainlink method gets data from oracle contract
  // calls back a method that will bill users
  // provides usage per user for <time period>
      // frequency of calling the oracle is set in configuration during sign up, and updateable
  function callChainlink() public {
    // Jan to implement this
  }

  function usageCallback(string[] memory accounts, uint256[] memory usages) public {
    require(accounts.length == usages.length, "Method must recieve same number of account and usage data points");
    // iterate over accountUsage while deducting from each account, but send payouts in 2 large transactions
    billAll(accounts, usages);
  }

  /////
  // AnyRate

  function setAnyRateTreasury(address payable treasury) public {
    // how to verify this address belongs to a Treasury?
    anyRateTreasury = treasury;
  }
  function setFee(uint256 _anyRateFee) public {
    anyRateFee = _anyRateFee;
  }

  /////
  // Client Business

  function setBusinessTreasury(address payable treasury) public {
    // how to verify this address belongs to a Treasury?
    clientTreasury = treasury;
  }
  function setCostPerUnit(uint256 _costPerUnit) public {
    costPerUnit = _costPerUnit;
  }

  /////
  // User Accounts

  // Send value to this contract on behalf of an account
  function depositTo(string calldata account) external payable {
    accountBalances[account] += msg.value;
    emit Deposit(msg.sender, account, msg.value);
  }

  /////
  // Billing

  // Figure out how much is owed each party
  function calculatePayment(uint256 usage) internal view
  returns (uint256 payment) {
    payment = usage / costPerUnit;
  }
  function calculateFee(uint256 payment) internal view
  returns (uint256 fee) {
    fee = payment / anyRateFee;
  }

  // Pay treasuries specified amounts
  function bill(string memory account, uint256 usage) public {
    // require(msg.sender == address(this), 'Only the billing contract may bill users');
    uint256 payment = calculatePayment(usage);
    uint256 fee = calculateFee(payment);
    if(accountBalances[account] < payment) {
      emit InsufficientFunds(account, accountBalances[account]);
    } else {
      accountBalances[account] -= payment;
      clientTreasury.transfer(payment - fee);
      emit PayBill(account, clientTreasury, payment);
      anyRateTreasury.transfer(fee);
      emit PayBill(account, anyRateTreasury, fee);
    }
  }

  // collect from everyone
  function billAll(string[] memory accounts, uint256[] memory usages) public {
    for (uint i = 0; i < accounts.length; i++) {
      bill(accounts[i], usages[i]);
    }
  }
}
