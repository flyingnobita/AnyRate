// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.6;

import "./Treasury.sol";

// What about ownership or access restriction on this contract?
contract TreasuryFactory {
  mapping(string => address payable) public treasuries;

  function createTreasury(string memory name) public {
    Treasury treasury = new Treasury(name);
    treasuries[name] = payable(address(treasury));
  }

  function callTransferTo(string memory name, address payable to, uint256 value) public {
    return Treasury(treasuries[name]).transferTo(to, value);
  }

  function callWithdrawAll(string memory name) public {
    return Treasury(treasuries[name]).withdrawAll(); 
  }

  function callName(string memory name) public
  returns (string memory) {
    return Treasury(treasuries[name]).name();
  }
}

