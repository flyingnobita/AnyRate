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
  Form,
  Heading,
  Input,
  Select,
  Text,
} from "rimble-ui";

const BillingForm = () => {
  const [companyName, setCompanyName] = useState("netflix");
  const [billingType, setBillingType] = useState("time");
  const [endpoint, setEndpoint] = useState(
    "https://anyrate-client-business-api.herokuapp.com/usage?account=b&since=4"
  );
  const [frequency, setFrequency] = useState(0);
  const [rate, setRate] = useState(0.01);
  const [overageThreshold, setOverageThreshold] = useState(-1);
  const [signer, setSigner] = useState();
  const [validated, setValidated] = useState(false);
  const [formValidated, setFormValidated] = useState(false);

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

  const handleCompanyName = (e) => {
    setCompanyName(e.target.value);
    validateInput(e);
  };

  const handleBillingType = (e) => {
    setBillingType(e.target.value);
    validateInput(e);
  };

  const handleRate = (e) => {
    let valueFloat = parseFloat(e.target.value);
    let valueFloatRounded = parseFloat(valueFloat.toFixed(2));
    setRate(valueFloatRounded);
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

  const handleEndpoint = (e) => {
    setEndpoint(e.target.value);
    validateInput(e);
  };

  const validateInput = (e) => {
    e.target.parentNode.classList.add("was-validated");
  };

  const validateForm = () => {
    if (
      companyName.length > 0 &&
      billingType.length > 0 &&
      endpoint.length > 0 &&
      rate > 0
      // frequency > 0
    ) {
      setValidated(true);
    } else {
      setValidated(false);
    }
  };

  useEffect(() => {
    validateForm();
  });

  async function handleSubmit() {
    const rateToSubmit = rate * 100;
    console.log("companyName: ", companyName);
    console.log("rateToSubmit: ", rateToSubmit);
    console.log("endpoint: ", endpoint);
    const res = await BillingFactoryWithSigner.createBilling(
      companyName,
      rateToSubmit,
      endpoint
    );
    console.log("createBilling: ", res);
  }

  return (
    <Form onSubmit={handleSubmit} validated={formValidated}>
      <Flex alignItems="center" alignContent="center" justifyContent="center">
        <Box width={[9 / 10]} maxWidth={800} marginTop={4}>
          <Card maxWidth={1000}>
            <Box marginBottom={2}>
              <Heading as={"h1"}>Billing Form</Heading>
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
                <Heading as={"h3"}>
                  How much ETH per{" "}
                  {billingType === "usage" ? "unit" : "pay period"} does your
                  service cost? (rounded to 2DP)
                </Heading>
                <Field label="Rate">
                  <Input
                    type="number"
                    required
                    placeholder="e.g. 0.01"
                    onChange={handleRate}
                    value={rate}
                  />
                </Field>
              </Flex>

              {/* <Heading as={"h3"}>
                How often should the customer be charged?
              </Heading>
              <Field label="Frequency">
                <Select
                  // Values in seconds
                  options={[
                    { value: 60, label: "per minute" },
                    { value: 3600, label: "hourly" },
                    { value: 86400, label: "daily" },
                    { value: 604800, label: "weekly" },
                    { value: 2635200, label: "monthly" },
                    { value: 31471200, label: "annually" },
                  ]}
                  required
                  onChange={handleFrequency}
                  value={frequency}
                />
              </Field> */}

              <Heading as={"h3"}>
                Where will we get the latest usage data?
              </Heading>
              <Box>
                <Field label="Endpoint">
                  <Input
                    minWidth={700}
                    type="url"
                    required
                    placeholder="e.g. https://my-company.provider.com/usage"
                    onChange={handleEndpoint}
                    value={endpoint}
                  />
                </Field>
              </Box>
            </Flex>

            {/* Condition */}
            {/* {billingType === "usage" && (
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
            )} */}
            <Button type="submit" disabled={!validated}>
              Deploy
            </Button>
          </Card>

          {/* <Text>companyName: {companyName}</Text>
          <Text>billingType: {billingType}</Text>
          <Text>endpoint: {endpoint}</Text>
          <Text>rate: {rate}</Text>
          <Text>frequency: {frequency}</Text>
          <Text>Valid form: {validated.toString()}</Text>
          <Text>Form validated: {formValidated.toString()}</Text> */}
        </Box>
      </Flex>
    </Form>
  );
};

export default BillingForm;
