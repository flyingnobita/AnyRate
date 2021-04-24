// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.6;

import "./Billing.sol";
import "./TreasuryFactory.sol";
import "./Treasury.sol";

// import "hardhat/console.sol";

contract BillingFactory {
    TreasuryFactory public treasuryFactory;
    Treasury public anyRateTreasury;
    uint256 public anyRateFee;

    string[] public clients;
    mapping(string => Billing) public billingContracts;

    constructor(uint256 _anyRateFee) public {
        anyRateFee = _anyRateFee;
        treasuryFactory = new TreasuryFactory();
        anyRateTreasury = treasuryFactory.createTreasury("AnyRate");
    }

    receive() external payable {}

    function createBilling(
        string memory clientName,
        uint256 costPerUnit,
        string memory usageURL
    ) public {
        Treasury clientTreasury = treasuryFactory.createTreasury(clientName);
        Billing billing =
            new Billing(
                clientTreasury,
                anyRateTreasury,
                anyRateFee,
                costPerUnit,
                usageURL
            );
        clients.push(clientName);
        billingContracts[clientName] = billing;
    }

    /////
    // AnyRate Admin

    // Old fees are "grandfathered" and remain valid by default
    function setAnyRateFee(uint256 _anyRateFee) public {
        anyRateFee = _anyRateFee;
    }

    // Update all Billing contract treasury addresses and change default
    function setAnyRateTreasury(address payable _anyRateTreasury) public {
        anyRateTreasury = Treasury(_anyRateTreasury);
        for (uint256 i = 0; i < clients.length; i++) {
            billingContracts[clients[i]].setAnyRateTreasury(
                Treasury(anyRateTreasury)
            );
        }
    }

    /////
    // Client Business

    function callSetBusinessTreasury(
        string memory clientName,
        address payable treasury
    ) public {
        billingContracts[clientName].setBusinessTreasury(Treasury(treasury));
    }

    function callSetCostPerUnit(string memory clientName, uint256 _costPerUnit)
        public
    {
        billingContracts[clientName].setCostPerUnit(_costPerUnit);
    }

    function callGetCostPerUnit(string memory clientName)
        public
        view
        returns (uint256)
    {
        return billingContracts[clientName].costPerUnit();
    }

    /////
    // User Accounts

    // Send value to this contract on behalf of an account
    function callDepositTo(string calldata clientName, string calldata account)
        external
        payable
    {
        Billing clientBilling = Billing(billingContracts[clientName]);
        clientBilling.depositTo{value: msg.value}(account);
    }

    function callAccountBalance(
        string calldata clientName,
        string calldata account
    ) external view returns (uint256 balance) {
        Billing clientBilling = Billing(billingContracts[clientName]);
        balance = clientBilling.accountBalance(account);
    }

    function callWithdraw(
        string calldata clientName,
        string calldata account,
        uint256 amount
    ) external {
        Billing clientBilling = Billing(billingContracts[clientName]);
        clientBilling.withdraw(account, amount);
    }

    /////
    // Billing

    // Bill everyone
    function callBillAll(string memory clientName) public {
        billingContracts[clientName].billAll();
    }
}
