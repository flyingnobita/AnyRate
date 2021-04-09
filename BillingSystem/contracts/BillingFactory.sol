// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.6;

import "./Billing.sol";
import "./TreasuryFactory.sol";
import "./Treasury";

contract BillingFactory {
  address public treasuryFactory;
  address payable public anyRateTreasury;
  uint256 public anyRateFee;

  string[] public clients;
  mapping(string => address payable) public billingContracts;

  constructor(uint256 _anyRateFee) {
    anyRateFEe = _anyRateFee;
    TreasuryFactory treasuryFactory = new TreasuryFactory();
    Treasury _anyRateTreasury = treasuryFactory.createTreasury("AnyRate");
    anyRateTreasury = payable(address(_anyRateTreasury));
  }

  function createBilling(
    string memory name,
    uint256 costPerUnit
  ) public {
    Treasury clientTreasury = TreasuryFactory(treasuryFactory).createTreasury(name);
    Billing billing = new Billing(
      payable(address(clientTreasury)),
      anyRateTreasury,
      anyRateFee,
      costPerUnit
    );
    clients.push(name);
    billingContracts[name] = payable(address(billing));
  }

  /////
  // AnyRate Admin

  // Old fees are "grandfathered" and remain valid by default
  function setAnyRateFee(uint256 _anyRateFee) public {
    anyRateFee = _anyRateFee;
  }

  // Update all Billing contract treasury addresses and change default
  function setAnyRateTreasury(address payable _treasury) public {
    anyRateTreasury = _anyRateTreasury;
    for (uint i = 0; i < clients.length; i++) {
      Billing clientBilling = Billing(clients[i]);
      clientBilling.setAnyRateTreasury(payable(address(treasury)));
    }
  }

  /////
  // Client Business

  function callSetBusinessTreasury(string memory name, address payable treasury) public {
      Billing clientBilling = Billing(billingContracts[name]);
      clientBilling.setBusinessTreasury(treasury);
  }

  function callSetCostPerUnit(string memory name, uint256 _costPerUnit) public {
      Billing clientBilling = Billing(billingContracts[name]);
      clientBilling.setCostPerUnit(_costPerUnit);
  }

  /////
  // User Accounts

  // Send value to this contract on behalf of an account
  function callDepositTo(string memory name, string calldata account) external payable {
      Billing clientBilling = Billing(billingContracts[name]);
      clientBilling.depositTo(account);
  }

  /////
  // Billing

  // collect from everyone
  function callBillAll(string memory name, string[] memory accounts, uint256[] memory usages) public {
      Billing clientBilling = Billing(billingContracts[name]);
      clientBilling.billAll(account);
  }
}
