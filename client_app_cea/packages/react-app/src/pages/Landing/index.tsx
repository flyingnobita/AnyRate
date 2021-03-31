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

const Landing = () => {
  const [sourceType, setSourceType] = useState("categorical");
  const [quantitativeThreshold, setQuantitaviteThreshold] = useState("");
  const [categoricalValue, setCategoricalValue] = useState("");
  const [action, setAction] = useState("credit");
  const [rate, setRate] = useState("");
  const [amount, setAmount] = useState("");

  const handleSourceType = (e) => {
    setSourceType(e.target.value);
    validateInput(e);
  };

  const handleQuantitativeThreshold = (e) => {
    setQuantitaviteThreshold(e.target.value);
    validateInput(e);
  };

  const handleCategoricalValue = (e) => {
    setCategoricalValue(e.target.value);
    validateInput(e);
  };

  const handleAction = (e) => {
    setAction(e.target.value);
    validateInput(e);
  };

  const handleRate = (e) => {
    setRate(e.target.value);
    validateInput(e);
  };

  const handleAmount = (e) => {
    setAmount(e.target.value);
    validateInput(e);
  };

  const [formValidated, setFormValidated] = useState(false);
  const [validated, setValidated] = useState(false);

  const validateInput = (e) => {
    e.target.parentNode.classList.add("was-validated");
  };

  const validateForm = () => {
    if (
      sourceType.length > 0 &&
      ((sourceType === "quantitative" && quantitativeThreshold.length > 0) ||
        (sourceType === "categorical" && categoricalValue.length > 0)) &&
      categoricalValue.length > 0 &&
      action.length > 0 &&
      rate.length > 0 &&
      amount.length > 0
    ) {
      setValidated(true);
    } else {
      setValidated(false);
    }
  };

  useEffect(() => {
    validateForm();
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted valid form");
  };

  return (
    <React.Fragment>
      <Flex alignItems="center" alignContent="center" justifyContent="center">
        <Box width={[9 / 10]} maxWidth={800} mt={4}>
          <Form onSubmit={handleSubmit} validated={formValidated}>
            <Card maxWidth={1000}>
              <Box>
                <Heading as={"h1"}>Blockchain Billing</Heading>
              </Box>

              {/* Sources */}
              <Flex flexDirection="column" alignItems="flex-start">
                <Heading as={"h2"}>Sources</Heading>
                <Heading as={"h3"}>Source Name</Heading>

                <Field label="Type">
                  <Select
                    options={[
                      { value: "categorical", label: "Categorical" },
                      { value: "quantitative", label: "Quantitative" },
                    ]}
                    required
                    value={sourceType}
                    onChange={handleSourceType}
                  />
                </Field>
              </Flex>

              {/* Condition */}
              <Flex flexDirection="column" alignItems="flex-start">
                <Heading as={"h2"}>Condition</Heading>

                {sourceType == "quantitative" && (
                  <Field label="Threshold">
                    <Input
                      type="number"
                      required
                      placeholder="e.g. 123"
                      onChange={handleQuantitativeThreshold}
                      value={quantitativeThreshold}
                    />
                  </Field>
                )}

                {sourceType == "categorical" && (
                  <Field label="Value">
                    <Input
                      type="text"
                      placeholder="e.g."
                      required
                      onChange={handleCategoricalValue}
                      value={categoricalValue}
                    />
                  </Field>
                )}
              </Flex>

              {/* Action */}
              <Flex
                flexDirection="column"
                alignItems="flex-start"
                flexWrap={"wrap"}
              >
                <Box>
                  <Heading as={"h2"}>Action</Heading>
                </Box>

                <Flex flexWrap={"wrap"}>
                  <Box mr={2}>
                    <Field label="Action Value">
                      <Select
                        options={[
                          { value: "credit", label: "Credit" },
                          { value: "debit", label: "Debit" },
                          { value: "notify", label: "Notify" },
                        ]}
                        required
                        onChange={handleAction}
                        value={action}
                      />
                    </Field>
                  </Box>
                  <Box mx={2}>
                    <Field label="Rate">
                      <Input
                        type="number"
                        placeholder="e.g. 0"
                        required
                        onChange={handleRate}
                        value={rate}
                      />
                    </Field>
                  </Box>
                  <Box ml={2}>
                    <Field label="Amount">
                      <Input
                        type="number"
                        placeholder="e.g. 0"
                        required
                        onChange={handleAmount}
                        value={amount}
                      />
                    </Field>
                  </Box>
                </Flex>
                <Flex>
                  <Box>
                    <Button type="submit" disabled={!validated}>
                      Submit
                    </Button>
                  </Box>
                </Flex>
              </Flex>
            </Card>
          </Form>

          <Card my={4}>
            <Heading as={"h4"}>Form values</Heading>
            <Text>Source Type: {sourceType}</Text>
            <Text>
              Quantitative Threshold: {quantitativeThreshold.toString()}
            </Text>
            <Text>Categorical Value: {categoricalValue.toString()}</Text>
            <Text>Action: {action.toString()}</Text>
            <Text>Valid form: {validated.toString()}</Text>
            <Checkbox
              label="Toggle Form Validation"
              value={formValidated}
              onChange={(e) => setFormValidated(!formValidated)}
            />
            <Text>Form validated: {formValidated.toString()}</Text>
          </Card>
        </Box>
      </Flex>
    </React.Fragment>
  );
};

export default Landing;
