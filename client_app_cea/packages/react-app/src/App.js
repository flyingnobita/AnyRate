import { Web3Provider } from "@ethersproject/providers";
import { Web3ReactProvider } from "@web3-react/core";
import React, { useRef, useState } from "react";
import FocusLock from "react-focus-lock";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { BaseStyles } from "rimble-ui";
import { ThemeProvider } from "styled-components";
import { Burger, Menu } from "./components";
import Wallet from "./components/Wallet";
import { GlobalStyles } from "./global";
import { useOnClickOutside } from "./hooks";
// import AnyRate from "./pages/AnyRate";
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
      <BrowserRouter>
        <ThemeProvider theme={customTheme}>
          <BaseStyles>
            <GlobalStyles />
            <div ref={node}>
              <FocusLock disabled={!open}>
                <Burger open={open} setOpen={setOpen} aria-controls={menuId} />
                <Menu open={open} setOpen={setOpen} id={menuId} />
              </FocusLock>
            </div>
            <Wallet />
            <div>
              <img
                src="https://image.flaticon.com/icons/svg/2016/2016012.svg"
                alt="burger icon"
              />
            </div>
            <Switch>
              <Route exact path={"/"} component={Landing} />
            </Switch>
          </BaseStyles>
        </ThemeProvider>
      </BrowserRouter>
    </Web3ReactProvider>
  );
}

export default App;
