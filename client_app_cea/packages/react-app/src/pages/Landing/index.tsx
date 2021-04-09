import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Flex,
  Heading,
  Image
} from "rimble-ui";
import howItWorks from "../../img/how_it_works.png";

const Landing = () => {
  return (
    <Flex alignItems="center" alignContent="center" justifyContent="center">
      <Box width={[9 / 10]} maxWidth={800} marginTop={4}>
        <Card maxWidth={1000}>
          <Box marginBottom={2}>
            <Heading as={"h1"}>AnyRate</Heading>
          </Box>
          <Flex flexDirection="column" alignItems="center">
            <Image
              alt="how_it_works"
              height="auto"
              width="80%"
              marginTop="50px"
              borderRadius={10}
              src={howItWorks}
            />
          </Flex>
        </Card>
      </Box>
    </Flex>
  );
};

export default Landing;
