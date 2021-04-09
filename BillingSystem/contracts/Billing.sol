// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

import "./Treasury.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";

contract Billing is Ownable, ChainlinkClient {
    Treasury clientTreasury;
    Treasury anyRateTreasury;
    uint256 public anyRateFee; // Reciprocal of rate expressed as a decimal -- this float math must be done off-chain
    uint256 public costPerUnit; // Same format as anyRateFee
    address private chainlinkNode;
    string private usageURL;
    bytes32 private jobId;
    uint256 private oracleFees;
    string private usagePath;

    struct Status {
      uint8 exists;
      uint256 balance;
      string lastUsageCall;
    }

    string[] public accounts; // This makes accountStatuses iterable
    mapping(string => Status) public accountStatuses; // Tracks who deposited how much value
    mapping(bytes32 => string) public requestIdsAccounts; // Match oracle response with account

    event Deposit(address from, string to, uint256 value);
    event InsufficientFunds(string account, uint256 funds);

    constructor(
        Treasury _clientTreasury,
        Treasury _anyRateTreasury,
        uint256 _anyRateFee,
        uint256 _costPerUnit,
        string memory _usageURL
    ) public {
        clientTreasury = _clientTreasury;
        anyRateTreasury = _anyRateTreasury;
        anyRateFee = _anyRateFee;
        costPerUnit = _costPerUnit;
        usageURL = _usageURL;

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

    function setUsageURL(string memory _usageURL) public {
        usageURL = _usageURL;
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
     * Depending on which endpoint to implement, url can be different per user
     * be taken into consideration in Factory.
     * @return requestId passed to the callback function
     */
    function callChainlinkUsage(string memory account)
    internal onlyOwner
    returns (bytes32 requestId)
    {
        string memory since = accountStatuses[account].lastUsageCall;
        accountStatuses[account].lastUsageCall = uintToString(now);
        string memory url =
            string(abi.encodePacked(usageURL, account, "?since=", since));

        Chainlink.Request memory req =
            buildChainlinkRequest(
                jobId,
                address(this),
                this.usageCallback.selector
            );
        req.add("url", url);
        req.add("path", usagePath);
        requestId = sendChainlinkRequestTo(chainlinkNode, req, oracleFees);
    }

    /**
     * @notice Callback function for callChainlinkUsage()
     * @dev function header updated to be inline with chainlink callback function example (see
     * example in AnyRateOracle.sol>fulfillUsage()).
     * Function needs to be adapted depending on the type of usage endpoint used.
     * @param usage uint256 / number
     */
    function usageCallback(bytes32 requestId, uint256 usage)
        public
        // recordChainlinkFulfillment(requestId)
    {
        bill(requestIdsAccounts[requestId], usage);
    }

    /////
    // AnyRate

    function setAnyRateTreasury(Treasury treasury)
    public {
          anyRateTreasury = treasury;
    }

    function setFee(uint256 _anyRateFee)
    public {
        anyRateFee = _anyRateFee;
    }

    /////
    // Client Business

    function setBusinessTreasury(Treasury treasury)
    public {
        clientTreasury = treasury;
    }

    function setCostPerUnit(uint256 _costPerUnit)
    public {
        costPerUnit = _costPerUnit;
    }

    /////
    // User Accounts

    // Send value to this contract on behalf of an account
    function depositTo(string calldata account)
    external
    payable {
        if (accountStatuses[account].exists == 0) {
            accounts.push(account);
            accountStatuses[account].exists = 1;
        }
        accountStatuses[account].balance += msg.value;
        emit Deposit(msg.sender, account, msg.value);
    }

    function accountBalance(string calldata account)
    external
    view
    returns (uint256 balance)
    {
      balance = accountStatuses[account].balance;
    }

    /////
    // Billing

    // Figure out how much is owed each party
    function calculatePayment(uint256 usage)
    internal
    view
    returns (uint256 payment) {
        payment = usage / costPerUnit;
    }

    function calculateFee(uint256 payment)
    internal
    view
    returns (uint256 fee) {
        fee = payment / anyRateFee;
    }

    // Pay treasuries specified amounts
    function bill(string memory account, uint256 usage)
    internal {
        uint256 payment = calculatePayment(usage);
        uint256 fee = calculatePayment(payment);
        if (accountStatuses[account].balance < payment) {
            emit InsufficientFunds(account, accountStatuses[account].balance);
        } else {
            accountStatuses[account].balance -= payment;
            payable(address(clientTreasury)).transfer(payment - fee);
            payable(address(anyRateTreasury)).transfer(fee);
        }
    }

    // Iterate over accounts while deducting from each
    // TODO: Send payments and fees from Billing to treasuries in 2 cumulative transactions
    function billAll()
    onlyOwner
    public {
        for (uint256 i = 0; i < accounts.length; i++) {
            callChainlinkUsage(accounts[i]);
        }
    }


    /////
    // Utility

    function uintToString(uint value)
    internal
    pure
    returns (string memory _uintAsString) {
        if (value == 0) {
          return "0";
        }
        uint j = value;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (value != 0) {
            bstr[k--] = byte(uint8(48 + value % 10));
            value /= 10;
        }
        return string(bstr);
    }
}
