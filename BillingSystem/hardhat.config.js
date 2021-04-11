/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-ethers");
require('dotenv').config();
const { TESTNET, INFURA_ID } = process.env;

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});
task("balances", "Prints the list of account balances", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(
      await ethers.getDefaultProvider(TESTNET, { infura: INFURA_ID }).getBalance(account.address)
    );
  }
});


module.exports = {
  solidity: "0.6.6",
};
