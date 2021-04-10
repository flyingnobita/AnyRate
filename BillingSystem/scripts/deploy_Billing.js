const hre = require("hardhat");
const DeployHelper = require("./deploy_helper");

const contractName = "Billing";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const deployHelper = new DeployHelper(deployer);
  await deployHelper.beforeDeploy();

  const contractFactory = await ethers.getContractFactory(contractName);
  const contract = await contractFactory.deploy();
  await contract.deployed();
  await deployHelper.afterDeploy(contract, contractName);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
