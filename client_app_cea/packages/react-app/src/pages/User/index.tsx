import { abis, addresses } from "@project/contracts";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Field,
  Flash,
  Flex,
  Heading,
  Input,
  Select,
} from "rimble-ui";

const User = () => {
  const [companyName, setCompanyName] = useState("netflix");
  const [userName, setUserName] = useState("b");
  const [depositAmount, setDepositAmount] = useState(2);
  const [withdrawAmount, setWithdrawAmount] = useState(1);
  const [currentUsage, setCurrentUsage] = useState(0);
  const [accountBalance, setAccountBalance] = useState("");
  const [signer, setSigner] = useState();
  const [treasuryFactoryContract, setTreasuryFactoryContract] = useState<
    ethers.Contract
  >();
  const [treasuryFactoryWithSigner, setTreasuryFactoryWithSigner] = useState<
    ethers.Contract
  >();

  const context = useWeb3React();

  useEffect(() => {
    if (context.library) {
      setSigner(context.library.getSigner(context.account));
    }
  }, [context.account, context.library]);

  const billingFactoryContract = new ethers.Contract(
    addresses.billingFactory,
    abis.billingFactory,
    context.library
  );

  let billingFactoryWithSigner: ethers.Contract = billingFactoryContract.connect(
    signer
  );

  async function getTreasuryFactory() {
    let treasuryFactoryAddress = await billingFactoryContract.treasuryFactory();
    console.log("treasuryFactoryAddress: ", treasuryFactoryAddress);
    let _treasuryFactoryContract = new ethers.Contract(
      treasuryFactoryAddress,
      abis.treasuryFactory,
      context.library
    );
    setTreasuryFactoryContract(_treasuryFactoryContract);
    // let _treasuryFactoryWithSigner = _treasuryFactoryContract.connect(signer);
    // setTreasuryFactoryWithSigner(_treasuryFactoryWithSigner);
    console.log("signer: ", signer);
    setTreasuryFactoryWithSigner(_treasuryFactoryContract.connect(signer));
  }

  useEffect(() => {
    if (billingFactoryContract.provider) {
      getTreasuryFactory();
    }
  }, [billingFactoryContract.provider, signer]);

  // const treasuryFactoryContract = new ethers.Contract(
  //   addresses.treasuryFactory,
  //   abis.treasuryFactory,
  //   context.library
  // );

  // let TreasuryFactoryWithSigner: ethers.Contract = treasuryFactoryContract.connect(
  //   signer
  // );

  useEffect(() => {
    fetch(
      // "https://anyrate-client-business-api.herokuapp.com/usage?account=b&since=4"
      "https://anyrate-client-business-api.herokuapp.com/usage?account=a&since="
    )
      .then((res) => res.json())
      .then((data) => {
        setCurrentUsage(data.count);
      });
  });

  async function getAccountBalance() {
    console.log(billingFactoryContract);
    billingFactoryContract
      .callAccountBalance(companyName, userName)
      .then((data) => {
        const dataParsed = ethers.utils.formatEther(data);
        setAccountBalance(dataParsed);
        console.log("getAccountBalance():", dataParsed);
      });
  }

  useEffect(() => {
    if (billingFactoryContract.provider) {
      getAccountBalance();
    }
  }, [billingFactoryContract.provider]);

  async function deposit() {
    console.log("Company Name: ", companyName);
    console.log("User Name: ", userName);
    console.log("depositAmount: ", depositAmount);

    if (depositAmount <= 0) {
      return;
    }

    const overrides = {
      value: ethers.utils.parseEther(depositAmount.toString()),
    };

    let tx = await billingFactoryWithSigner.callDepositTo(
      companyName,
      userName,
      overrides
    );
    console.log(tx);
  }

  async function withdraw() {
    console.log("Company Name: ", companyName);
    console.log("User Name: ", userName);
    console.log("Withdraw Amount: ", withdrawAmount);

    if (withdrawAmount <= 0) {
      return;
    }

    const withdrawAmountParsed = ethers.utils.parseEther(
      withdrawAmount.toString()
    );

    let tx = await billingFactoryWithSigner.callWithdraw(
      companyName,
      userName,
      withdrawAmountParsed
    );
    console.log(tx);
  }

  const createBilling = (e) => {
    billingFactoryWithSigner
      .createBilling(
        companyName,
        3,
        "https://anyrate-sails-api.herokuapp.com/api/usagecount/user/1/since/20210401"
      )
      .then((data) => {
        console.log("createBilling: ", data);
      });
  };

  const createTreasury = (e) => {
    treasuryFactoryWithSigner.createTreasury(companyName).then((data) => {
      console.log("createTreasury: ", data);
    });
  };

  const handleCallName = (e) => {
    treasuryFactoryWithSigner.callName(companyName).then((data) => {
      console.log(data);
    });
  };

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

  return (
    <Flex
      alignItems="center"
      alignContent="center"
      justifyContent="space-around"
    >
      <Box width={[9 / 10]} maxWidth={800} marginTop={4}>
        <Card maxWidth={1000}>
          <Heading as={"h1"}>Customer</Heading>
          <Flex>
            <Flex
              flexDirection="column"
              alignItems="flex-start"
              justifyContent="space-around"
            >
              {/* <Button onClick={createTreasury}>
                Treasury Factory createTreasury()
              </Button>

              <Button onClick={handleCallName}>
                Treasury Factory handleCallName()
              </Button>

              <Button onClick={createBilling}>
                Billing Factory createBilling()
              </Button> */}

              <Field label="Company Name">
                <Input
                  type="text"
                  required
                  value={companyName}
                  onChange={handleCompanyName}
                />
              </Field>
              <Field label="User Name">
                <Input
                  type="text"
                  required
                  value={userName}
                  onChange={handleUserName}
                />
              </Field>
              <Field label="Current Usage">
                <Input type="number" required disabled value={currentUsage} />
              </Field>
              <Flex marginY={1} alignItems="center">
                <Box>
                  <Field label="Account Balance">
                    <Input
                      type="number"
                      required
                      disabled
                      value={accountBalance}
                    />
                  </Field>
                </Box>
                <Box marginX={5}>
                  <Button size="small" onClick={getAccountBalance}>
                    Get Account Balance
                  </Button>
                </Box>
              </Flex>
              <Flex marginY={1} alignItems="center">
                <Box>
                  <Field label="Deposit (ETH)">
                    <Input
                      type="number"
                      required
                      placeholder="00"
                      value={depositAmount}
                      onChange={changeDeposit}
                    />
                  </Field>
                </Box>
                <Box marginX={5}>
                  <Button size="small" onClick={deposit}>
                    Deposit
                  </Button>
                </Box>
              </Flex>
              <Flex marginY={1} alignItems="center">
                <Box>
                  <Field label="Withdraw (ETH)">
                    <Input
                      type="number"
                      required
                      placeholder="00"
                      value={withdrawAmount}
                      onChange={changeWithdraw}
                    />
                  </Field>
                </Box>
                <Box marginX={5}>
                  <Button size="small" onClick={withdraw}>
                    Withdraw
                  </Button>
                </Box>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      </Box>
    </Flex>
  );
};

export default User;
