import React from "react";
import { NavLink } from "react-router-dom";
import { Box, Flex, Heading, Link } from "rimble-ui";
import Wallet from "../Wallet";
import { Nav, NavCenter, NavHeader, NavLeft, NavRight } from "./Header.styled";

function Header() {
  return (
    <Nav>
      <NavHeader>
        <NavLeft></NavLeft>

        <NavCenter>
          <NavLink to="/">
            <Heading as={"h2"}>AnyRate</Heading>
          </NavLink>
        </NavCenter>

        <NavRight>
          <Flex alignItems="center">
            <Box marginRight={3}>
              <Link
                href="https://github.com/AnyRate/AnyRate"
                target="_blank"
                title="This link goes somewhere"
              >
                Github
              </Link>
            </Box>
            <Box>
              <Wallet />
            </Box>
          </Flex>
        </NavRight>
      </NavHeader>
    </Nav>
  );
}

export default Header;
