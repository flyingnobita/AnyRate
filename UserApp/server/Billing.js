const fs = require('fs');
const Web3 = require('web3');
const billingAddress = process.env.BILLING_CONTRACT || '';
const nodeURL = process.env.NODE_URL || 0;
const nodePort = process.env.NODE_PORT || 0;

/// Need to modify this for the Acala Bodhi.js provider
module.exports = class BillingContract {
  constructor() {
    this.eth = new Web3(nodeURL || `http://localhost:${nodePort}`).eth;
    const { Contract } = this.eth;
    let abiJSON = fs.readFileSync('abi/Billing.json');
    let abi = JSON.parse(abiJSON);
    this.contract = new Contract(abi, contractAddress);
  }
  depositTo(senderAddress, account, value) {
    const options = {
      from: senderAddress,
      value: value
    }
    this.contract.methods.depositTo(account).send(options)
      .on('confirmation', (confirmationNumber, receipt) => {
        // console.log('confirmation number', confirmationNumber);
        console.log('sent transaction');
      })
      .on('error', err => console.error('Error sending saveListHash', err))
  } 
}
