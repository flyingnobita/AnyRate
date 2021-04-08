// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import "./Treasury.sol";
import "hardhat/console.sol";

contract Billing is Ownable {
    address payable clientTreasury;
    address payable anyRateTreasury;
    uint256 public anyRateFee; // Reciprocal of rate expressed as a decimal -- this float math must be done off-chain
    uint256 public costPerUnit; // Same format as anyRateFee
    address private chainlinkNode;
    bytes32 private jobId;
    uint256 private oracleFees;
    string private usagePath;

    struct Status {
      uint256 balance;
      string lastUsageCall;
    }

    mapping(string => Status) public accountStatuses; // Tracks who deposited how much value
    mapping(bytes32 => account) public requestIdsAccounts; // Tracks which oracle request is for which account's usage

    event Deposit(address from, string to, uint256 value);
    event PayBill(string from, address to, uint256 value);
    event InsufficientFunds(string account, uint256 funds);

    constructor(
        address payable _clientTreasury,
        address payable _anyRateTreasury,
        uint256 _anyRateFee,
        uint256 _costPerUnit
    ) public {
        clientTreasury = _clientTreasury;
        anyRateTreasury = _anyRateTreasury;
        anyRateFee = _anyRateFee;
        costPerUnit = _costPerUnit;

        chainlinkNode = 0xAA1DC356dc4B18f30C347798FD5379F3D77ABC5b;
        jobId = "c7dd72ca14b44f0c9b6cfcd4b7ec0a2c";
        oracleFees = 0.1 * 10**18; // 1 LINK
        usagePath = "count";
    }

    receive() external payable {}

    /////
    // Oracle

    function setChainlinkNode(address payable _chainlinkNode) public {
        chainlinkNode = _chainlinkNode;
    }

    function setAnyRateOracleJobId(bytes32 _jobId) public {
        jobId = _jobId;
    }

    function setAnyRateOracleFees(uint256 _oracleFees) public {
        oracleFees = _oracleFees;
    }

    // chainlink method gets data from oracle contract
    // calls back a method that will bill users
    // provides usage per user for <time period>
    // frequency of calling the oracle is set in configuration during sign up, and updateable
    /**
     * @notice Creates a request to the specified Oracle contract address
     * @dev Uses the contract's chainlinkNode, jobId and oracleFees for Chainlink
     * Node, which should be the same for all generated contracts.
     * jobId is for job "httpget -> Uint256".
     * Chainlink Core Adapters doesn't support returning arrays, nor does it seem
     * for External Adapter.
     * I created 2 types of endpoint, see here:
     * https://www.notion.so/Chainlink-5ef99b9117c8414ea5ea3f4d711f3896
     * Depending on which endpoint to implement, _url can be different per user
     * be taken into consideration in Factory.
     * @return requestId passed to the callback function
     */
    function callChainlinkUsage(string account)
    public onlyOwner
    returns (bytes32 requestId)
    {
        string since = accountStatuses[account].since;
        accountStatuses[account].since = now;
        string memory _url =
            "https://anyrate-sails-api.herokuapp.com/api/usagecount/" + account + "?since=" + since;

        Chainlink.Request memory req =
            buildChainlinkRequest(
                jobId,
                address(this),
                this.usageCallback.selector
            );
        req.add("url", _url);
        req.add("path", "count");
        requestId = sendChainlinkRequestTo(chainlinkNode, req, oracleFees);
    }

    /**
     * @notice Callback function for callChainlinkUsage()
     * @dev function header updated to be inline with chainlink callback function example (see
     * example in AnyRateOracle.sol>fulfillUsage()).
     * Function needs to be adapted depending on the type of usage endpoint used.
     * @param _usage return type depends on URL endpoint
     * @return
     */
    function usageCallback(bytes32 _requestId, bytes32 _usage)
        public
        recordChainlinkFulfillment(_requestId)
    {
        require(
            accounts.length == usages.length,
            "Method must recieve same number of account and usage data points"
        );
        string account = requestIdsAccounts[_requestId];
        // iterate over accountUsage while deducting from each account, but send payouts in 2 large transactions
        bill(account, _usage);
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
        accountBalances[account].balance += msg.value;
        emit Deposit(msg.sender, account, msg.value);
    }

    /////
    // Billing

    // Figure out how much is owed each party
    function calculatePayment(uint256 usage)
        internal
        view
        returns (uint256 payment)
    {
        payment = usage / costPerUnit;
    }

    function calculateFee(uint256 payment) internal view returns (uint256 fee) {
        fee = payment / anyRateFee;
    }

    // Pay treasuries specified amounts
    function bill(string memory account, uint256 usage) public {
        // require(msg.sender == address(this), 'Only the billing contract may bill users');
        uint256 payment = calculatePayment(usage);
        uint256 fee = calculateFee(payment);
        if (accountBalances[account].balance < payment) {
            emit InsufficientFunds(account, accountBalances[account].balance);
        } else {
            accountBalances[account].balance -= payment;
            clientTreasury.transfer(payment - fee);
            emit PayBill(account, clientTreasury, payment);
            anyRateTreasury.transfer(fee);
            emit PayBill(account, anyRateTreasury, fee);
        }
    }

    // collect from everyone
    function billAll(string[] memory accounts, uint256[] memory usages) public {
        for (uint256 i = 0; i < accounts.length; i++) {
            callChainlinkUsage(accounts[i]);
        }
    }
}
