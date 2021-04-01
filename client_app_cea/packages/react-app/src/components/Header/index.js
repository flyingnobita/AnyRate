import React from "react";
import { NavLink } from "react-router-dom";
import { Heading } from "rimble-ui";
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
          <Wallet />
        </NavRight>
      </NavHeader>
    </Nav>
  );
}

export default Header;
