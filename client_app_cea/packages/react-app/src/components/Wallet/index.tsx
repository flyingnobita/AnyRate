import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import React, { useCallback } from "react";
import { MetaMaskButton } from "rimble-ui";
import { injected } from "../web3-react/connectors";
import { useEagerConnect, useInactiveListener } from "../web3-react/hooks";
import WalletConnected from "./WalletConnected";

const Wallet = () => {
  const {
    connector,
    library,
    chainId,
    account,
    activate,
    deactivate,
    active,
    error,
  } = useWeb3React<Web3Provider>();

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = React.useState<any>();
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector);

  const connect = useCallback(async () => {
    await activate(injected);
  }, [activate]);

  const disconnect = useCallback(async () => {
    deactivate();
  }, [deactivate]);

  return (
    <div>
      <div style={{ paddingTop: 10 }}>
        {active && chainId ? (
          <WalletConnected disconnect={disconnect} chainId={chainId} />
        ) : (
          <MetaMaskButton.Outline onClick={connect}>
            Connect
          </MetaMaskButton.Outline>
        )}
      </div>
    </div>
  );
};
export default Wallet;
