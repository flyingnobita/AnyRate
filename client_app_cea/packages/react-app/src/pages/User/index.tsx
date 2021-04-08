import { abis, addresses } from "@project/contracts";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import React from "react";
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

class User extends React.Component<{}, UserState> {
  constructor(props: any) {
    super(props);
    this.state = {
      depositAmount: 0,
      withdrawAmount: 0,
      currentUsage: 0,
    };
  }

  componentDidMount() {
    fetch(
      "https://anyrate-sails-api.herokuapp.com/api/usagecount/user/1/since/20210401"
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        this.setState({ currentUsage: data.count });
      });
  }

  changeDeposit = (e) => {
    this.setState({ depositAmount: e.target.value });
  };
  changeWithdraw = (e) => {
    this.setState({ withdrawAmount: e.target.value });
  };

  submitDeposit = (e) => {
    console.log("use ethers to deposit");
  };
  submitWithdraw = (e) => {
    console.log("use ethers to withdraw");
  };

  render() {
    const { depositAmount, withdrawAmount, currentUsage } = this.state;

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
                    onChange={this.changeDeposit}
                  />
                </Field>
                <Button onClick={this.submitDeposit}>Deposit</Button>
                <Field label="Withdraw">
                  <Input
                    type="number"
                    required
                    placeholder="00"
                    value={withdrawAmount}
                    onChange={this.changeWithdraw}
                  />
                </Field>
                <Button onClick={this.submitWithdraw}>Withdraw</Button>
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
  }
}

export default User;
