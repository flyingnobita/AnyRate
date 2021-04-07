import { bool } from "prop-types";
import React from "react";
import { NavLink } from "react-router-dom";
import { StyledMenu } from "./Menu.styled";

const Menu = ({ open, ...props }) => {
  const isHidden = open ? true : false;
  const tabIndex = isHidden ? 0 : -1;

  return (
    <StyledMenu open={open} aria-hidden={!isHidden} {...props}>
      <NavLink to="/" activeClassName="hurray" tabIndex={tabIndex}>
        <span aria-hidden="true">🏠</span>
        Home
      </NavLink>
      {/* <a href="/" tabIndex={tabIndex}>
        <span aria-hidden="true">🏠</span>
        Home
      </a> */}
      <NavLink to="/oracle" activeClassName="hurray" tabIndex={tabIndex}>
        <span aria-hidden="true">📀</span>
        Oracle
      </NavLink>
      {/* <a href="/oracle" tabIndex={tabIndex}>
        <span aria-hidden="true">📀</span>
        Oracle
      </a> */}
      <NavLink to="/user" activeClassName="hurray" tabIndex={tabIndex}>
        <span aria-hidden="true">🖲️</span>
        User
      </NavLink>
    </StyledMenu>
  );
};

Menu.propTypes = {
  open: bool.isRequired,
};

export default Menu;
