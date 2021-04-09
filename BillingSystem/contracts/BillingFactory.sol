// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.6;

import "./Billing.sol";
import "./TreasuryFactory.sol";
import "./Treasury";

contract BillingFactory {
  address public treasuryFactory;
  address payable public anyRateTreasury;

  string[] public clients;
  mapping(string => address payable) public billingContracts;

  constructor() {
    treasuryFactory = new TreasuryFactory();
  }

  function createBilling(
    string memory name,
    address payable clientTreasury,
    address payable anyRateTreasury,
    uint256 anyRateFee,
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

  function setAnyRateTreasury(address payable treasury) public {
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
