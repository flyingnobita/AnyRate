// import { Signer, Contract } from "ethers";
const hre = require("hardhat");
// import * as fs from "fs";
const fs = require("fs");

module.exports = class DeployHelper {
  deployer;
  deployerBalanceBefore = "";
  deployerBalanceBeforeReadable = "";
  deployerBalanceAfter = "";
  deployerBalanceAfterReadable = "";
  deployerAddress = "";

  constructor(deployer) {
    this.deployer = deployer;
  }

  async beforeDeploy() {
    this.deployerBalanceBefore = (await this.deployer.getBalance()).toString();
    this.deployerAddress = await this.deployer.getAddress();
  }

  async afterDeploy(contract, contractName) {
    this.deployerBalanceBeforeReadable = ethers.utils.commify(
      ethers.utils.formatEther(this.deployerBalanceBefore)
    );

    this.deployerBalanceAfter = (await this.deployer.getBalance()).toString();
    this.deployerBalanceAfterReadable = ethers.utils.commify(
      ethers.utils.formatEther(this.deployerBalanceAfter)
    );

    // console.log("Contract Name:", contract.name());
    console.log("Contract:", contract.address);
    console.log("Deployer:", await this.deployer.getAddress());
    console.log("Deployer Balance Before:", this.deployerBalanceBeforeReadable);
    console.log("Deployer Balance After:", this.deployerBalanceAfterReadable);

    saveFrontendFiles(
      contract,
      contractName,
      this.deployerAddress,
      this.deployerBalanceBeforeReadable,
      this.deployerBalanceAfterReadable
    );
  }
};

function saveFrontendFiles(
  contract,
  contractName,
  deployerAddress,
  deployerBalanceBeforeReadable,
  deployerBalanceAfterReadable
) {
  const contractsDir = __dirname + "/../frontend";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/" + contractName + "_address.json",
    JSON.stringify(
      {
        Contract: contract.address,
        Deployer: deployerAddress,
        "Deployer Balance Before": deployerBalanceBeforeReadable,
        "Deployer Balance After": deployerBalanceAfterReadable,
      },
      undefined,
      2
    )
  );

  const ContractArtifact = hre.artifacts.readArtifactSync(contractName)["abi"];

  fs.writeFileSync(
    contractsDir + "/" + contractName + ".json",
    JSON.stringify(ContractArtifact, null, 2)
  );
}
