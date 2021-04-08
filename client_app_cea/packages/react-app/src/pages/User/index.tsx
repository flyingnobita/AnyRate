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

type UserState = {
  depositAmount: number;
  withdrawAmount: number;
  currentUsage: any;
};

// const web3Context = useWeb3React();
// const chainlinkContract = new ethers.Contract(
//   addresses.anyRateOracle,
//   abis.anyRateOracle,
//   web3Context.library
// );

const User = () => {
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [currentUsage, setCurrentUsage] = useState(0);

  useEffect(() => {
    fetch(
      "https://anyrate-sails-api.herokuapp.com/api/usagecount/user/1/since/20210401"
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setCurrentUsage(data.count);
      });
  });

  const changeDeposit = (e) => {
    setDepositAmount(e.target.value);
  };

  const changeWithdraw = (e) => {
    setWithdrawAmount(e.target.value);
  };

  const submitDeposit = (e) => {
    console.log("use ethers to deposit");
  };

  const submitWithdraw = (e) => {
    console.log("use ethers to withdraw");
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
              <Text>All values in ETH</Text>
              <Field label="Deposit">
                <Input
                  type="number"
                  required
                  placeholder="00"
                  value={depositAmount}
                  onChange={changeDeposit}
                />
              </Field>
              <Button onClick={submitDeposit}>Deposit</Button>
              <Field label="Withdraw">
                <Input
                  type="number"
                  required
                  placeholder="00"
                  value={withdrawAmount}
                  onChange={changeWithdraw}
                />
              </Field>
              <Button onClick={submitWithdraw}>Withdraw</Button>
            </Flex>
            <Flex
              flexDirection="column"
              alignItems="flex-start"
              justifyContent="space-around"
            >
              <Text>Current usage: {currentUsage}</Text>
            </Flex>
          </Flex>
        </Card>
      </Box>
    </Flex>
  );
};

export default User;
