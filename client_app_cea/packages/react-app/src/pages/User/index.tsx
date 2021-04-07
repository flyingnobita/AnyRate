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
  Text,
} from "rimble-ui";

const User = (props) => {
  const { recentUsage } = props;
  
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const handleDeposit = (e) => {
    setDepositAmount(e.target.value);
  };
  const handleWithdraw = (e) => {
    setWithdrawAmount(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted form");
  };

  return (
    <Flex>
      <Heading as={"h1"}>User Dashboard</Heading>
      <Form onSubmit={handleSubmit}>
        <Field label="Deposit">
          <Input
            type="number"
            required
            placeholder="000"
            value={depositAmount}
            onChange={handleDeposit}
          />
        </Field>
        <Field label="Withdraw">
          <Input
            type="number"
            required
            placeholder="000"
            value={withdrawAmount}
            onChange={handleWithdraw}
          />
        </Field>
        <Text>
          {/* How do I use fetch from this kind of component? Need it to be a class? */}
          Recent usage: {recentUsage} 
        </Text>
      </Form>
    </Flex>
  )
}

export default User;
