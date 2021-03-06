import { abis, addresses } from "@project/contracts";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Input } from "rimble-ui";

// let oracleAddress = "0xAA1DC356dc4B18f30C347798FD5379F3D77ABC5b";
let oracleAddress = "0x1b666ad0d20bC4F35f218120d7ed1e2df60627cC";
let jobId: string = ethers.utils.hexlify(
  // ethers.utils.toUtf8CodePoints("c7dd72ca14b44f0c9b6cfcd4b7ec0a2c") // uint256
  ethers.utils.toUtf8CodePoints("2d3cc1fdfede46a0830bbbf5c0de2528") // uint256
);
let fee: string = (0.1 * 10 ** 18).toString(); // 0.1 Link

async function CallOracleUsage(contract) {
  let url: string =
    "https://anyrate-client-business-api.herokuapp.com/usage?account=a&since=";
  // "https://anyrate-client-business-api.herokuapp.com/usage?account=b&since=4";
  let path: string = "count";

  contract
    .createRequestForUsage(oracleAddress, jobId, fee, url, path)
    .then((requestId) => {
      console.log("requestId / Request Transaction Hash: ", requestId);
    })
    .catch((error: any) => {
      window.alert(
        "Failure!" + (error && error.message ? `\n\n${error.message}` : "")
      );
    });
}

async function CallOracleUnitCost(contract) {
  let url: string = "https://anyrate-sails-api.herokuapp.com/api/moviecost";
  let path: string = "unitCost";

  contract
    .createRequestForUnitCost(oracleAddress, jobId, fee, url, path)
    .then(() => {
      console.log("done");
    })
    .catch((error: any) => {
      window.alert(
        "Failure!" + (error && error.message ? `\n\n${error.message}` : "")
      );
    });
}

const Oracle = () => {
  const context = useWeb3React();

  const chainlinkContract = new ethers.Contract(
    addresses.anyRateOracle,
    abis.anyRateOracle,
    context.library
  );

  const [signer, setSigner] = useState();
  const [usage, setUsage] = useState("");
  const [unitCost, setUnitCost] = useState("");

  useEffect(() => {
    if (context.library) {
      setSigner(context.library.getSigner(context.account));
    }
  }, [context.account, context.library]);

  let chainlinkWithSigner: ethers.Contract = chainlinkContract.connect(signer);

  async function GetUsage() {
    chainlinkWithSigner.getUsage().then((data) => {
      console.log("Usage: ", data.toString());
      setUsage(data.toString());
    });
  }

  async function GetUnitCost() {
    chainlinkWithSigner.getUnitCost().then((data) => {
      console.log("Unit Cost: ", data.toString());
      setUnitCost(data.toString());
    });
  }

  return (
    <React.Fragment>
      <Flex flexDirection="column" alignItems="center">
        <Flex>
          <Box p={3}>
            <Button
              minWidth={"12rem"}
              onClick={() => CallOracleUsage(chainlinkWithSigner)}
            >
              Call Oracle Usage
            </Button>
          </Box>
          <Box p={3}>
            <Button
              minWidth={"12rem"}
              onClick={() => CallOracleUnitCost(chainlinkWithSigner)}
            >
              Call Oracle Unit Cost
            </Button>
          </Box>
        </Flex>

        <Flex>
          <Box p={3}>
            <Button minWidth={"12rem"} onClick={() => GetUsage()}>
              Get Usage
            </Button>
          </Box>
          <Box p={3}>
            <Flex>
              <Box>
                <Input
                  type="text"
                  placeholder=""
                  required={true}
                  disabled
                  bg="white"
                  value={usage}
                  minWidth={300}
                />
              </Box>
            </Flex>
          </Box>
        </Flex>

        <Flex>
          <Box p={3}>
            <Button minWidth={"12rem"} onClick={() => GetUnitCost()}>
              Get Unit Cost
            </Button>
          </Box>
          <Box p={3}>
            <Flex>
              <Box>
                <Input
                  type="text"
                  placeholder=""
                  required={true}
                  disabled
                  bg="white"
                  value={unitCost}
                />
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Flex>
    </React.Fragment>
  );
};
export default Oracle;
