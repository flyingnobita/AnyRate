import { useQuery } from "@apollo/react-hooks";
// import { Main, textStyle } from "@aragon/ui";
// import { Web3Provider } from "@ethersproject/providers";
// import { Web3ReactProvider } from "@web3-react/core";
import { BrowserRouter, Route, Switch } from "react-router-dom";
// import { UseWalletProvider } from "use-wallet";
// import Navigation from "./components/Navigation";
// import Web3React from "./components/web3-react";
import GET_TRANSFERS from "./graphql/subgraph";
// import AnyRate from "./pages/AnyRate";
import Landing from "./pages/Landing";

import React, { useState, useRef } from "react";
import { ThemeProvider } from "styled-components";
import { useOnClickOutside } from "./hooks";
import { GlobalStyles } from "./global";
import { theme } from "./theme";
import { Burger, Menu } from "./components";
import FocusLock from "react-focus-lock";

require("dotenv").config();

// function getLibrary(provider) {
//   const library = new Web3Provider(provider);
//   library.pollingInterval = 12000;
//   return library;
// }

// function App() {
//   const { loading, error, data } = useQuery(GET_TRANSFERS);

//   React.useEffect(() => {
//     if (!loading && !error && data && data.transfers) {
//       console.log({ transfers: data.transfers });
//     }
//   }, [loading, error, data]);

//   return (
//     <Web3ReactProvider getLibrary={getLibrary}>
//       <UseWalletProvider
//         chainId={31337}
//         connectors={{
//           injected: {},
//         }}
//       >
//         <BrowserRouter>
//           <Main>
//             <div
//               css={`
//                 ${textStyle("title1")};
//               `}
//             >
//               Test Title 1
//             </div>
//             <Navigation />
//             {/* <Layout> */}
//             <Switch>
//               <Route exact path={"/"} component={Landing} />
//             </Switch>
//             {/* </Layout> */}
//           </Main>
//         </BrowserRouter>
//       </UseWalletProvider>
//     </Web3ReactProvider>
//   );
// }

function App() {
  const [open, setOpen] = useState(false);
  const node = useRef();
  const menuId = "main-menu";

  useOnClickOutside(node, () => setOpen(false));

  return (
    // <Web3ReactProvider getLibrary={getLibrary}>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <>
          <GlobalStyles />
          <div ref={node}>
            <FocusLock disabled={!open}>
              <Burger open={open} setOpen={setOpen} aria-controls={menuId} />
              <Menu open={open} setOpen={setOpen} id={menuId} />
            </FocusLock>
          </div>
          <div>
            <h1>Hello. This is burger menu tutorial</h1>
            <img
              src="https://image.flaticon.com/icons/svg/2016/2016012.svg"
              alt="burger icon"
            />
            <small>
              Icon made by <a href="https://www.freepik.com/home">Freepik</a>{" "}
              from <a href="https://www.flaticon.com">www.flaticon.com</a>
            </small>
          </div>
          <Switch>
            <Route exact path={"/"} component={Landing} />
          </Switch>
        </>
      </ThemeProvider>
    </BrowserRouter>
    // </Web3ReactProvider>
  );
}

export default App;
