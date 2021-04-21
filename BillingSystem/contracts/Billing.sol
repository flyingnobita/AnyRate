// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.6;

import "./Treasury.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";

import "hardhat/console.sol";

contract Billing is Ownable, ChainlinkClient {
    Treasury clientTreasury;
    Treasury anyRateTreasury;
    uint256 public anyRateFee;
    uint256 public costPerUnit;
    address private chainlinkNode;
    string private usageURL;
    bytes32 private jobId;
    uint256 private oracleFees;
    string private usagePath;
    uint256 private accountId; // string[] doesn't have length, use accountId to keep track

    struct Account {
        string accountName;
        bool isAccount;
        uint256 balance;
        string lastUsageCall;
        address knownAddress;
    }

    string[] public accountArray;
    mapping(string => Account) public accountDetails; // Tracks who deposited how much value
    mapping(bytes32 => string) public requestIdsAccounts; // Match oracle response with account

    event Deposit(address from, string to, uint256 value);
    event InsufficientFunds(string accountName, uint256 funds);

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
        oracleFees = 0.1 * 10**18; // 0.1 LINK
        usagePath = "count";
        accountId = 0;
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
    function callChainlinkUsage(string memory accountName)
        internal
        onlyOwner
        returns (bytes32 requestId)
    {
        console.log("callChainlinkUsage - BEGIN");
        string memory since = accountDetails[accountName].lastUsageCall;
        accountDetails[accountName].lastUsageCall = uintToString(now);
        string memory url =
            string(
                abi.encodePacked(
                    usageURL,
                    "?account=",
                    accountName,
                    "&since=",
                    since
                )
            );
        console.log("callChainlinkUsage - 1");
        Chainlink.Request memory req =
            buildChainlinkRequest(
                jobId,
                address(this),
                this.usageCallback.selector
            );
        console.log("callChainlinkUsage - 2");
        req.add("url", url);
        req.add("path", usagePath);
        requestId = sendChainlinkRequestTo(chainlinkNode, req, oracleFees);
        console.log("callChainlinkUsage - FINISH");
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

    function setAnyRateTreasury(Treasury treasury) public {
        anyRateTreasury = treasury;
    }

    function getAnyRateTreasury() public view returns (Treasury) {
        return anyRateTreasury;
    }

    function setFee(uint256 _anyRateFee) public {
        anyRateFee = _anyRateFee;
    }

    /////
    // Client Business

    function setBusinessTreasury(Treasury treasury) public {
        clientTreasury = treasury;
    }

    function setCostPerUnit(uint256 _costPerUnit) public {
        costPerUnit = _costPerUnit;
    }

    /////
    // User Accounts

    // Send value to this contract on behalf of an account
    // Creates an account if not exist
    function depositTo(string calldata accountName) external payable {
        if (accountDetails[accountName].isAccount == false) {
            accountArray.push(accountName);
            accountDetails[accountName].isAccount = true;
            accountDetails[accountName].knownAddress = msg.sender;
            accountId++;
        }
        accountDetails[accountName].balance += msg.value;
        emit Deposit(msg.sender, accountName, msg.value);
    }

    function accountBalance(string calldata accountName)
        external
        view
        returns (uint256 balance)
    {
        balance = accountDetails[accountName].balance;
    }

    // Todo: Update known address or let knownAddresses be an array

    function withdraw(string calldata accountName, uint256 amount)
        external
        onlyOwner
    {
        require(
            accountDetails[accountName].balance > amount,
            "This account does not have enough to withdraw"
        );
        require(
            accountDetails[accountName].knownAddress == msg.sender,
            "This account may not belong to the requester"
        );
        accountDetails[accountName].balance -= amount;
        msg.sender.transfer(amount);
    }

    /////
    // Billing

    // Figure out how much is owed each party
    function calculatePayment(uint256 usage)
        internal
        view
        returns (uint256 payment)
    {
        payment = usage * costPerUnit;
    }

    function calculateFee(uint256 payment) internal view returns (uint256 fee) {
        fee = (payment * anyRateFee) / 10000;
    }

    // Pay treasuries specified amounts
    function bill(string memory accountName, uint256 usage) public onlyOwner {
        uint256 payment = calculatePayment(usage);
        uint256 fee = calculateFee(payment);
        if (accountDetails[accountName].balance < payment) {
            emit InsufficientFunds(
                accountName,
                accountDetails[accountName].balance
            );
        } else {
            accountDetails[accountName].balance -= payment;
            payable(address(clientTreasury)).transfer(payment - fee);
            payable(address(anyRateTreasury)).transfer(fee);
        }
    }

    // Iterate over accounts while deducting from each
    // TODO: Send payments and fees from Billing to treasuries in 2 cumulative transactions
    function billAll() public onlyOwner {
        console.log("Billing.billAll()");
        console.log("accountId: ", accountId);
        for (uint256 i = 0; i < accountId; i++) {
            console.log("i: ", i);
            console.log("accountArray[i]: ", accountArray[i]);
            callChainlinkUsage(accountArray[i]);
        }
    }

    /////
    // Utility

    function uintToString(uint256 value)
        internal
        pure
        returns (string memory _uintAsString)
    {
        if (value == 0) {
            return "0";
        }
        uint256 j = value;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len - 1;
        while (value != 0) {
            bstr[k--] = bytes1(uint8(48 + (value % 10)));
            value /= 10;
        }
        return string(bstr);
    }
}
