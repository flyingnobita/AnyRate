import { Web3Provider } from "@ethersproject/providers";
import { Web3ReactProvider } from "@web3-react/core";
import React, { useRef, useState } from "react";
import FocusLock from "react-focus-lock";
import { HashRouter, Route, Switch } from "react-router-dom";
import { BaseStyles } from "rimble-ui";
import { ThemeProvider } from "styled-components";
import { Burger, Menu } from "./components";
import Header from "./components/Header";
import { GlobalStyles } from "./global";
import { useOnClickOutside } from "./hooks";
import AnyRate from "./pages/AnyRate";
import BillingForm from "./pages/BillingForm";
import User from "./pages/User";
import Landing from "./pages/Landing";
import { customTheme } from "./theme";

require("dotenv").config();

function getLibrary(provider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

function App() {
  const [open, setOpen] = useState(false);
  const node = useRef();
  const menuId = "main-menu";

  useOnClickOutside(node, () => setOpen(false));

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <HashRouter>
        <Header />
        <ThemeProvider theme={customTheme}>
          <BaseStyles>
            <GlobalStyles />
            <div ref={node}>
              <FocusLock disabled={!open}>
                <Burger open={open} setOpen={setOpen} aria-controls={menuId} />
                <Menu open={open} setOpen={setOpen} id={menuId} />
              </FocusLock>
            </div>
            <Switch>
              <Route exact path={"/"} component={Landing} />
              <Route exact path={"/BillingForm"} component={BillingForm} />
              <Route exact path={"/oracle"} component={AnyRate} />
              <Route exact path={"/user"} component={User} />
            </Switch>
          </BaseStyles>
        </ThemeProvider>
      </HashRouter>
    </Web3ReactProvider>
  );
}

export default App;
