// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.6;

import "./Treasury.sol";

// What about ownership or access restriction on this contract?
contract TreasuryFactory {
    mapping(string => Treasury) public treasuries;

    function createTreasury(string memory name)
        public
        returns (Treasury treasury)
    {
        treasury = new Treasury(name);
        treasuries[name] = treasury;
    }

    function callTransferTo(
        string memory name,
        address payable to,
        uint256 value
    ) public {
        return treasuries[name].transferTo(to, value);
    }

    function callWithdrawAll(string memory name) public {
        return treasuries[name].withdrawAll();
    }

    function callName(string memory name) public view returns (string memory) {
        return treasuries[name].name();
    }

    function balanceOf(string memory name) public view returns (uint256) {
      return address(treasuries[name]).balance;
    }
}
