import { abis, addresses } from "@project/contracts";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Field,
  Flex,
  Form,
  Heading,
  Input,
  Select,
  Text,
} from "rimble-ui";

const billingFactoryAddress = "";

async function createBilling(contract: ethers.Contract, name: string, costPerUnit: number) {
  contract
    .createBilling(billingFactoryAddress, name, costPerUnit)
    .then(() => {
      console.log(`Created billing contract for ${name} with cost per unit ${costPerUnit}`);
    })
    .catch((error: any) => {
      window.alert(
        "Failure!" + (error && error.message ? `\n\n${error.message}` : "")
      );
    });
}

const BillingForm = () => {

  /////
  // Connect to Ethereum Wallet
  // const context = useWeb3React();
  // const billingFactory = new ethers.Contract(
  //   addresses.billingFactory,
  //   abis.billingFactory,
  //   context.library
  // );
  // const [signer, setSigner] = useState();
  /////

  const [companyName, setCompanyName] = useState("");
  const [billingType, setBillingType] = useState("time");
  const [endpoint, setEndpoint] = useState("");
  const [frequency, setFrequency] = useState(0);
  const [rate, setRate] = useState(0);
  const [overageThreshold, setOverageThreshold] = useState(-1);

  const handleCompanyName = (e) => {
    setCompanyName(e.target.value);
    validateInput(e);
  };

  const handleBillingType = (e) => {
    setBillingType(e.target.value);
    validateInput(e);
  };

  const handleEndpoint = (e) => {
    setEndpoint(e.target.value);
    validateInput(e);
  };

  const handleOverageThreshold = (e) => {
    setOverageThreshold(e.target.value);
    validateInput(e);
  };

  const handleFrequency = (e) => {
    setFrequency(e.target.value);
    validateInput(e);
  };

  const handleRate = (e) => {
    setRate(e.target.value);
    validateInput(e);
  };

  const [formValidated, setFormValidated] = useState(false);
  const [validated, setValidated] = useState(false);

  const validateInput = (e) => {
    e.target.parentNode.classList.add("was-validated");
  };

  const validateForm = () => {
    if (
      companyName.length > 0 &&
      billingType.length > 0 &&
      endpoint.length > 0 &&
      rate > 0 &&
      frequency > 0
    ) {
      setValidated(true);
    } else {
      setValidated(false);
    }
  };

  useEffect(() => {
    validateForm();
  });

  const handleSubmit = (_e) => {
    // createBilling(billingFactory, companyName, rate);
    console.log("Submitted valid form");
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

            <Heading as={"h3"}>Do you charge by time or usage?</Heading>
            <Field label="Type">
              <Select
                options={[
                  { value: "time", label: "Time" },
                  { value: "usage", label: "Usage" },
                ]}
                required
                value={billingType}
                onChange={handleBillingType}
              />
            </Field>
          
            {/* When billingType is "time", this is not multiplied by usage */}
            <Flex flexDirection="column" alignItems="flex-start">
              <Heading as={"h3"}>How much ETH per {billingType === "usage" ? 'unit' : 'pay period' } does your service cost?</Heading>
              <Field label="Rate">
                <Input
                  type="number"
                  required
                  placeholder="0.001"
                  step="0.000001"
                  onChange={handleRate}
                  value={rate}
                />
              </Field>

            </Flex>

            <Heading as={"h3"}>How often should the customer be charged?</Heading>
            <Field label="Frequency">
              <Select
              // Values in seconds
                options={[
                  { value: 60, label: "per minute" },
                  { value: 3600, label: "hourly" },
                  { value: 86400, label: "daily" },
                  { value: 604800, label: "weekly" },
                  { value: 2635200, label: "monthly" },
                  { value: 31471200, label: "annually" }
                ]}
                required
                onChange={handleFrequency}
                value={frequency}
              />
            </Field>

            <Heading as={"h3"}>Where will we get the latest usage data?</Heading>
            <Field label="Endpoint">
              <Input
                type="text"
                required
                placeholder="e.g. https://my-company.provider.com/usage"
                onChange={handleEndpoint}
                value={endpoint}
              />
            </Field>

          </Flex>

          {/* Condition */}
          {billingType === "usage" && (
            <Flex flexDirection="column" alignItems="flex-start">
              <Field label="Overage Threshold">
                <Input
                  type="number"
                  required
                  placeholder="e.g. 9000"
                  onChange={handleOverageThreshold}
                  value={overageThreshold}
                />
              </Field>

            </Flex>
          )}
          <Button onClick={handleSubmit}>
            Deploy
          </Button>
        </Card>

        <Text>Form validated: {formValidated.toString()}</Text>
      </Box>
    </Flex>
  );
};

export default BillingForm;
