import { useWeb3React } from "@web3-react/core";
import React, { useMemo } from "react";
import { Button } from "rimble-ui";

export default function WalletConnected({
  disconnect,
  chainId,
}: {
  disconnect: Function;
  chainId: number;
}) {
  const { account } = useWeb3React();
  const userAddress = account;

  const addressDisplayed = useMemo(
    () => userAddress.slice(0, 6) + "..." + userAddress.slice(-4),
    [userAddress]
  );

  console.log("userAddress: ", userAddress);
  const networkName = useMemo(() => (chainId === 1 ? "Mainnet" : "Testnet"), [
    chainId,
  ]);

  return (
    <div>
      <Button size="small" onClick={disconnect}>
        {addressDisplayed}
      </Button>
    </div>
  );
}
