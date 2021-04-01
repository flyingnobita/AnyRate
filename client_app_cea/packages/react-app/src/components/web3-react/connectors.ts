import { InjectedConnector } from "@web3-react/injected-connector";
import { NetworkConnector } from "@web3-react/network-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

const POLLING_INTERVAL = 12000;
const RPC_URLS: { [chainId: number]: string } = {
  1: (process.env.REACT_APP_RPC_URL_1 as string) || "http://127.0.0.1:8545",
  4: (process.env.REACT_APP_RPC_URL_4 as string) || "http://127.0.0.1:8545",
  31337:
    (process.env.REACT_APP_RPC_URL_31337 as string) || "http://127.0.0.1:8545",
};

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 31337],
});

export const network = new NetworkConnector({
  urls: { 1: RPC_URLS[1], 4: RPC_URLS[4], 31337: RPC_URLS[31337] },
  defaultChainId: 31337,
});

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1] },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: POLLING_INTERVAL,
});
