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
  const [transferToAddress, setTransferToAddress] = useState("0x00");
  const [treasuryBalance, setTreasuryBalance] = useState("0");
  const [signer, setSigner] = useState();

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
  
  useEffect(() => {
    async () => {
      setTreasuryBalance((await treasuryFactoryWithSigner()).callBalanceOf(companyName));
  }});

  const handleCompanyName = (e) => {
    setCompanyName(e.target.value);
  };

  const handleTransferToAddress = (e) => {
    setTransferToAddress(e.target.value);
  };

  const treasuryFactoryWithSigner = async () => {
    let treasuryFactoryContract = new ethers.Contract(
      await billingFactoryContract.treasuries[companyName],
      abis.treasuryFactory,
      context.library
    );
    let TreasuryFactoryWithSigner: ethers.Contract = treasuryFactoryContract.connect(
      signer
    );
    return TreasuryFactoryWithSigner;
  }

  const submitTransferTo = async () => {
    if (!transferToAddress || !companyName) { return }
   
    let tx = (await treasuryFactoryWithSigner()).callDepositTo(
      companyName,
      transferToAddress
    );
    console.log(tx);
  };

  const submitWithdrawAll = async () => {
    if (!companyName) { return }
    
    let tx = (await treasuryFactoryWithSigner()).callWithdrawAll(companyName);
    console.log(tx);
  };

  return (
      <Flex alignItems="center" alignContent="center" justifyContent="center">
        <Box width={[9 / 10]} maxWidth={800} marginTop={4}>
          <Card maxWidth={1000}>
            <Box marginBottom={2}>
              <Heading as={"h1"}>Billing Contract</Heading>
            </Box>

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

              {/* When billingType is "time", this is not multiplied by usage */}
              <Flex flexDirection="column" alignItems="flex-start">
                <Heading as={"h3"}>
                  Transfer to:
                </Heading>
                <Field label="Address">
                  <Input
                    type="text"
                    placeholder="0x0a"
                    onChange={handleTransferToAddress}
                    value={transferToAddress}
                  />
                </Field>
              </Flex>
              <Button onClick={submitTransferTo}>Transfer</Button>
            </Flex>
            <Text>Treasury Balance: {treasuryBalance.toString()}</Text>

            <Button onClick={submitWithdrawAll}>Withdraw All</Button>
          </Card>

        </Box>
      </Flex>
  );
};

export default ClientBusiness;
