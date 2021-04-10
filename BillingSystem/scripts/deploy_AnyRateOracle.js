const hre = require("hardhat");
const DeployHelper = require("./deploy_helper");

const contractName = "AnyRateOracle";
const linkTokenAddressKovan = "0xa36085F69e2889c224210F603D836748e7dC0088";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const deployHelper = new DeployHelper(deployer);
  await deployHelper.beforeDeploy();

  const contractFactory = await hre.ethers.getContractFactory(contractName);
  const contract = await contractFactory.deploy(linkTokenAddressKovan);
  await contract.deployed();
  await deployHelper.afterDeploy(contract, contractName);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
