import React from 'react';
import { ethers } from 'ethers';
import { options } from '@acala-network/api';
import { Provider, Wallet } from '@acala-network/bodhi';
import { WsProvider, Keyring } from '@polkadot/api';
import utilCrypto from '@polkadot/util-crypto';
import util from '@polkadot/util';
import { abi as BillingAbi } from '../../../BillingSystem/build/Billing.json';

const evmPort = 9944;
const billingContractAddress = '0x0';

interface UserApp {
  evmProvider: Provider,
  billingContract: ethers.Contract,
  wallet: Wallet
}

class UserApp extends React.Component {
  constructor(props: any) {
    super(props);
    this.evmProvider = new Provider(
      options({
        provider: new WsProvider(`ws://localhost:${evmPort}`)
      })
    );
    this.billingContract = new ethers.Contract(
      billingContractAddress,
      BillingAbi,
      this.evmProvider
    );
    this.state = {
      walletAddress: ''
    }
  }

  handleWalletAddressChange(address: string) {
    this.setState({ walletAddress: address });
  }

  render() {
    return(
      <div>
        <h1>Account Portal</h1>
        <input type="text" onChange={(e) => this.handleWalletAddressChange(e.target.value)} />
      </div>
    )
  }
}

export default UserApp;
