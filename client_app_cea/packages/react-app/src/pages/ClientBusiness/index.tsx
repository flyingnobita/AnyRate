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
  Text,
} from "rimble-ui";

const ClientBusiness = () => {
  const [companyName, setCompanyName] = useState("netflix");
  const [transferToAddress, setTransferToAddress] = useState("");
  const [transferToAmount, setTransferToAmount] = useState();
  const [treasuryBalance, setTreasuryBalance] = useState("0");
  const [costPerUnit, setCostPerUnit] = useState(0);
  const [currentCostPerUnit, setCurrentCostPerUnit] = useState("");
  const [signer, setSigner] = useState();
  const [treasuryFactoryContract, setTreasuryFactoryContract] = useState<
    ethers.Contract
  >();
  const [treasuryFactoryWithSigner, setTreasuryFactoryWithSigner] = useState<
    ethers.Contract
  >();
  const [billingAddress, setBillingAddress] = useState("");
  const [billingContract, setBillingContract] = useState<ethers.Contract>();
  const [billingContractWithSigner, setBillingContractWithSigner] = useState<
    ethers.Contract
  >();
  const [oracleUsage, setOracleUsage] = useState(0);

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
  let BillingFactoryWithSigner: ethers.Contract = billingFactoryContract.connect(
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
    console.log("signer: ", signer);
    setTreasuryFactoryWithSigner(_treasuryFactoryContract.connect(signer));
  }

  async function getCurrentCostPerUnit() {
    billingFactoryContract
      .callGetCostPerUnit(companyName)
      .then((data) => {
        const dataParsed = ethers.utils.formatEther(data);
        setCurrentCostPerUnit(dataParsed);
        console.log("getCurrentCostPerUnit():", dataParsed);
      })
      .catch((err) => console.error("getCurrentCostPerUnit(): ", err));
  }

  useEffect(() => {
    if (billingFactoryContract.provider) {
      getTreasuryFactory();
      getCurrentCostPerUnit();
    }
  }, [billingFactoryContract.provider, signer]);

  async function getTreasuryBalance() {
    treasuryFactoryContract.balanceOf(companyName).then((data) => {
      const dataParsed = ethers.utils.formatEther(data);
      setTreasuryBalance(dataParsed);
      console.log("getTreasuryBalance():", dataParsed);
    });
  }

  useEffect(() => {
    if (treasuryFactoryContract) {
      getTreasuryBalance();
    }
  }, [treasuryFactoryContract]);

  async function getBillingAddress() {
    let billingAddress = await billingFactoryContract.billingContracts(
      companyName
    );
    setBillingAddress(billingAddress);
    let _billingContract = new ethers.Contract(
      billingAddress,
      abis.billing,
      context.library
    );
    setBillingContract(_billingContract);
    setBillingContractWithSigner(_billingContract.connect(signer));
  }

  async function getOracleUsage() {
    console.log("billingContract: ", billingContract);
    let usageReturned = await billingContract.getUsageReturned();
    setOracleUsage(usageReturned);
  }

  async function callChainlinkUsage() {
    await billingContractWithSigner.callChainlinkUsage("a");
  }

  const submitTransferTo = async () => {
    if (!transferToAddress || !companyName) {
      return;
    }

    let tx = await treasuryFactoryWithSigner.callTransferTo(
      companyName,
      transferToAddress,
      transferToAmount
    );
    console.log(tx);
  };

  async function submitWithdrawAll() {
    if (!companyName) {
      return;
    }

    console.log("treasuryFactoryWithSigner: ", treasuryFactoryWithSigner);
    console.log("companyName: ", companyName);
    let tx = await treasuryFactoryWithSigner.callWithdrawAll(companyName);
    console.log(tx);
  }

  async function submitCostPerUnit() {
    if (!companyName) {
      return;
    }

    const weiPerUnit = ethers.utils.parseEther(costPerUnit.toString());
    console.log("billingFactoryWithSigner: ", BillingFactoryWithSigner);
    console.log("companyName: ", companyName);
    console.log("weiPerUnit: ", weiPerUnit);
    let tx = await BillingFactoryWithSigner.callSetCostPerUnit(
      companyName,
      weiPerUnit
    );
    console.log(tx);
  }

  const handleCompanyName = (e) => {
    setCompanyName(e.target.value);
  };

  const handleTransferToAddress = (e) => {
    setTransferToAddress(e.target.value);
  };

  const handleCostPerUnit = (e) => {
    setCostPerUnit(e.target.value);
  };

  const handleTransferToAmount = (e) => {
    setTransferToAmount(e.target.value);
  };

  return (
    <Flex alignItems="center" alignContent="center" justifyContent="center">
      <Box width={[9 / 10]} maxWidth={800} marginTop={4}>
        <Card maxWidth={1000}>
          <Box marginBottom={2}>
            <Heading as={"h1"}>Business - Treasury Management</Heading>
          </Box>

          {/* <Button onClick={getTreasuryFactory}>Get Treasury Factory</Button> */}
          {/* <Button onClick={getTreasuryBalance}>Get Treasury Balance</Button> */}

          {/* User Usage Data Endpoint */}
          <Flex flexDirection="column" alignItems="flex-start">
            <Field label="Company Name">
              <Input
                type="text"
                required
                placeholder="e.g. Netflix"
                value={companyName}
                onChange={handleCompanyName}
              />
            </Field>
          </Flex>

          {/* When billingType is "time", this is not multiplied by usage */}
          <Flex marginY={1} alignItems="center">
            <Box>
              <Field label="Transfer to Address">
                <Input
                  type="text"
                  required
                  placeholder="e.g. 0x0a"
                  onChange={handleTransferToAddress}
                  value={transferToAddress}
                />
              </Field>
              <Field label="Amount">
                <Input
                  type="number"
                  required
                  placeholder="e.g. 0.001"
                  onChange={handleTransferToAmount}
                  value={transferToAmount}
                />
              </Field>
            </Box>
            <Box marginX={5}>
              <Button size="small" onClick={submitTransferTo}>
                Transfer
              </Button>
            </Box>
          </Flex>

          <Flex marginY={1} alignItems="center">
            <Box>
              <Field label="Current Cost Per Unit">
                <Input
                  type="number"
                  required
                  disabled
                  value={currentCostPerUnit}
                />
              </Field>
            </Box>
          </Flex>
          <Flex marginY={1} alignItems="center">
            <Box>
              <Field label="Update Cost Per Unit (in ETH)">
                <Input
                  type="number"
                  required
                  placeholder="e.g. 0.001"
                  onChange={handleCostPerUnit}
                  value={costPerUnit}
                />
              </Field>
            </Box>
            <Box marginX={5}>
              <Button size="small" onClick={submitCostPerUnit}>
                Update
              </Button>
            </Box>
          </Flex>
          <Flex marginY={1} alignItems="center">
            <Box>
              <Field label="Treasury Balance">
                <Input
                  type="number"
                  required
                  disabled
                  value={treasuryBalance}
                />
              </Field>
            </Box>
            <Box marginX={5}>
              <Button size="small" onClick={submitWithdrawAll}>
                Withdraw All
              </Button>
            </Box>
          </Flex>

          <Flex marginY={1} alignItems="center">
            <Box>
              <Field label="Billing Address">
                <Input
                  minWidth={400}
                  type="address"
                  required
                  disabled
                  value={billingAddress}
                />
              </Field>
            </Box>
            <Box marginX={5}>
              <Button size="small" onClick={getBillingAddress}>
                Get Billing Address
              </Button>
            </Box>
          </Flex>

          <Flex marginY={1} alignItems="center">
            <Box>
              <Field label="Billing.usageReturned">
                <Input type="number" required disabled value={oracleUsage} />
              </Field>
            </Box>
            <Box marginX={5}>
              <Button size="small" onClick={getOracleUsage}>
                [Call Get Billing Address 1st!] Get Billing.getUsageReturned()
              </Button>
            </Box>
          </Flex>
          <Button size="small" onClick={callChainlinkUsage}>
            [Make sure Billing.sol has Link token!]
            Billing.callChainlinkUsage("a")
          </Button>
        </Card>
      </Box>
    </Flex>
  );
};

export default ClientBusiness;
