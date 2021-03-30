import React from "react";
import { Heading, Link } from "rimble-ui";
import Wallet from "../Wallet";
import { Nav, NavCenter, NavHeader, NavLeft, NavRight } from "./Header.styled";

function Header() {
  return (
    <Nav>
      <NavHeader>
        <NavLeft></NavLeft>

        <NavCenter>
          <Link href="\" title="Home">
            <Heading as={"h2"}>AnyRate</Heading>
          </Link>
        </NavCenter>

        <NavRight>
          <Wallet />
        </NavRight>
      </NavHeader>
    </Nav>
  );
}

export default Header;
