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
      <NavLink to="/BillingForm" activeClassName="hurray" tabIndex={tabIndex}>
        <span aria-hidden="true">🏦</span>
        Billing Form
      </NavLink>
      <NavLink to="/oracle" activeClassName="hurray" tabIndex={tabIndex}>
        <span aria-hidden="true">📀</span>
        Oracle
      </NavLink>
      <NavLink to="/user" activeClassName="hurray" tabIndex={tabIndex}>
        <span aria-hidden="true">🖲️</span>
        User
      </NavLink>
      <NavLink
        to="/ClientBusiness"
        activeClassName="hurray"
        tabIndex={tabIndex}
      >
        <span aria-hidden="true">❤️</span>
        Business
      </NavLink>
      <NavLink to="/AnyRateAdmin" activeClassName="hurray" tabIndex={tabIndex}>
        <span aria-hidden="true">⚙️</span>
        Admin
      </NavLink>
    </StyledMenu>
  );
};

Menu.propTypes = {
  open: bool.isRequired,
};

export default Menu;
