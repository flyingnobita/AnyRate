import { abis, addresses } from "@project/contracts";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { Box, Button, Card, Field, Flex, Heading, Input } from "rimble-ui";

const AnyRateAdmin = () => {
  const [companyName, setCompanyName] = useState("netflix");
  const [newAnyRateFee, setNewAnyRateFee] = useState(0);
  const [currentAnyRateFee, setCurrentAnyRateFee] = useState(0);
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
  let billingFactoryWithSigner: ethers.Contract = billingFactoryContract.connect(
    signer
  );

  async function getAnyRateFee() {
    billingFactoryContract.anyRateFee().then((data) => {
      let newValue = data / 100;
      console.log("anyRateFee():", newValue.toString());
      setCurrentAnyRateFee(newValue);
      setNewAnyRateFee(newValue);
    });
  }

  useEffect(() => {
    if (billingFactoryContract.provider) {
      getAnyRateFee();
    }
  }, [billingFactoryContract.provider]);

  const updateNewAnyRateFee = (e) => {
    let value = e.target.value;
    if (value < 0) {
      return;
    }
    let valueRounded = parseFloat(value).toFixed(2);
    console.log("newAnyRateFee: ", valueRounded);
    setNewAnyRateFee(value);
  };

  async function submitNewAnyRateFee() {
    console.log("newAnyRateFee: ", newAnyRateFee);

    if (newAnyRateFee < 0 || newAnyRateFee > 1) {
      return;
    }
    let newAnyRateFeeToSubmit = newAnyRateFee * 100;
    console.log("newAnyRateFeeToSubmit: ", newAnyRateFeeToSubmit);

    let tx = await billingFactoryWithSigner.setAnyRateFee(
      newAnyRateFeeToSubmit
    );
    console.log(tx);
  }

  const handleCompanyName = (e) => {
    setCompanyName(e.target.value);
  };

  async function billAll() {
    console.log(companyName);
    billingFactoryWithSigner
      .callBillAll(companyName)
      .then((res) => console.log("billAll():", res))
      .catch((err) => console.error(err));
  }

  return (
    <Flex
      alignItems="center"
      alignContent="center"
      justifyContent="space-around"
    >
      <Box width={[9 / 10]} maxWidth={800} marginTop={4}>
        <Card maxWidth={1000}>
          <Heading as={"h1"}>Admin Dashboard</Heading>
          <Flex>
            <Flex
              flexDirection="column"
              alignItems="flex-start"
              justifyContent="space-around"
            >
              <Flex marginY={1} alignItems="center">
                <Box>
                  <Field label="Current AnyRate Fee (in decimal)">
                    <Input
                      type="number"
                      required
                      disabled
                      value={currentAnyRateFee}
                    />
                  </Field>
                </Box>
                <Box marginLeft={5}>
                  <Button size="small" onClick={getAnyRateFee}>
                    Get
                  </Button>
                </Box>
              </Flex>
              <Flex marginY={1} alignItems="center">
                <Box>
                  <Field label="New AnyRate Fee (<= 1, rounded to 2 DP)">
                    <Input
                      type="number"
                      required
                      placeholder="e.g. 0.02"
                      value={newAnyRateFee}
                      onChange={updateNewAnyRateFee}
                    />
                  </Field>
                </Box>
                <Box marginLeft={5}>
                  <Button size="small" onClick={submitNewAnyRateFee}>
                    Update
                  </Button>
                </Box>
              </Flex>
            </Flex>
          </Flex>
          <Flex marginY={1} alignItems="center">
            <Box>
              <Field label="Client">
                <Input
                  type="text"
                  required
                  placeholder="Business Name e.g. netflix"
                  value={companyName}
                  onChange={handleCompanyName}
                />
              </Field>
            </Box>
            <Box marginLeft={5}>
              <Button size="small" onClick={billAll}>
                Bill All
              </Button>
            </Box>
          </Flex>
        </Card>
      </Box>
    </Flex>
  );
};

export default AnyRateAdmin;
