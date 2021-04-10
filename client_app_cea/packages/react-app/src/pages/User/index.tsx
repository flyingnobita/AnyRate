import { abis, addresses } from "@project/contracts";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Field,
  Flex,
  Heading,
  Input,
  Select
} from "rimble-ui";

const User = () => {
  const [companyName, setCompanyName] = useState("netflix");
  const [userName, setUserName] = useState(1);
  const [depositAmount, setDepositAmount] = useState(2);
  const [withdrawAmount, setWithdrawAmount] = useState(1);
  const [currentUsage, setCurrentUsage] = useState(0);
  const [accountBalance, setAccountBalance] = useState(0);
  const [signer, setSigner] = useState();

  const context = useWeb3React();

  const billingFactoryContract = new ethers.Contract(
    addresses.billingFactory,
    abis.billingFactory,
    context.library
  );

  const treasuryFactoryContract = new ethers.Contract(
    addresses.treasuryFactory,
    abis.treasuryFactory,
    context.library
  );

  useEffect(() => {
    if (context.library) {
      setSigner(context.library.getSigner(context.account));
    }
  }, [context.account, context.library]);

  let BillingFactoryWithSigner: ethers.Contract = billingFactoryContract.connect(
    signer
  );

  let TreasuryFactoryWithSigner: ethers.Contract = treasuryFactoryContract.connect(
    signer
  );

  useEffect(() => {
    fetch(
      "https://anyrate-sails-api.herokuapp.com/api/usagecount/user/1/since/20210401"
    )
      .then((res) => res.json())
      .then((data) => {
        setCurrentUsage(data.count);
      });
  });

  const handleCompanyName = (e) => {
    setCompanyName(e.target.value);
  };

  const handleUserName = (e) => {
    setUserName(e.target.value);
  };

  const changeDeposit = (e) => {
    setDepositAmount(e.target.value);
  };

  const changeWithdraw = (e) => {
    setWithdrawAmount(e.target.value);
  };

  const getAccountBalance = (e) => {
    BillingFactoryWithSigner.callAccountBalance(companyName, userName).then(
      (data) => {
        setAccountBalance(data.toString());
        console.log("getAccountBalance():", data.toString());
      }
    );
  };

  async function deposit() {
    console.log("Company Name: ", companyName);
    console.log("User Name: ", userName);
    console.log("depositAmount: ", depositAmount);

    const overrides = {
      value: ethers.utils.parseEther(depositAmount.toString()),
    };

    let tx = await BillingFactoryWithSigner.callDepositTo(
      companyName,
      userName,
      overrides
    );
  }

  async function withdraw() {
    console.log("Company Name: ", companyName);
    console.log("User Name: ", userName);
    console.log("Withdraw Amount: ", withdrawAmount);

    let tx = await BillingFactoryWithSigner.callWithdraw(
      companyName,
      userName,
      withdrawAmount
    );
  }

  const createBilling = (e) => {
    BillingFactoryWithSigner.createBilling(
      companyName,
      3,
      "https://anyrate-sails-api.herokuapp.com/api/usagecount/user/1/since/20210401"
    ).then((data) => {
      console.log("createBilling: ", data);
    });
  };

  const createTreasury = (e) => {
    TreasuryFactoryWithSigner.createTreasury(companyName).then((data) => {
      console.log("createTreasury: ", data);
    });
  };

  const handleCallName = (e) => {
    TreasuryFactoryWithSigner.callName(companyName).then((data) => {
      console.log(data);
    });
  };

  return (
    <Flex
      alignItems="center"
      alignContent="center"
      justifyContent="space-around"
    >
      <Box width={[9 / 10]} maxWidth={800} marginTop={4}>
        <Card maxWidth={1000}>
          <Heading as={"h1"}>User Dashboard</Heading>
          <Flex>
            <Flex
              flexDirection="column"
              alignItems="flex-start"
              justifyContent="space-around"
            >
              <Button onClick={createTreasury}>
                Treasury Factory createTreasury()
              </Button>

              <Button onClick={handleCallName}>
                Treasury Factory handleCallName()
              </Button>

              <Button onClick={createBilling}>
                Billing Factory createBilling()
              </Button>

              <Field label="Company Name">
                <Select
                  options={[{ value: "netflix", label: "Netflix" }]}
                  required
                  value={companyName}
                  onChange={handleCompanyName}
                />
              </Field>
              <Field label="User Name">
                <Input
                  type="text"
                  required
                  disabled
                  value={userName}
                  onChange={handleUserName}
                />
              </Field>
              <Field label="Current Usage">
                <Input type="number" required disabled value={currentUsage} />
              </Field>
              <Field label="Account Balance">
                <Input type="number" required disabled value={accountBalance} />
              </Field>
              <Button onClick={getAccountBalance}>Get Account Balance</Button>
              <Field label="Deposit (ETH)">
                <Input
                  type="number"
                  required
                  placeholder="00"
                  value={depositAmount}
                  onChange={changeDeposit}
                />
              </Field>
              <Button onClick={deposit}>Deposit</Button>
              <Field label="Withdraw (ETH)">
                <Input
                  type="number"
                  required
                  placeholder="00"
                  value={withdrawAmount}
                  onChange={changeWithdraw}
                />
              </Field>
              <Button onClick={withdraw}>Withdraw</Button>
            </Flex>
          </Flex>
        </Card>
      </Box>
    </Flex>
  );
};

export default User;
