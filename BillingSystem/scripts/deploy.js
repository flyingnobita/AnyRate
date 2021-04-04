// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Treasury = await hre.ethers.getContractFactory("Treasury");
  
  const businessTreasury = await Treasury.deploy();
  await businessTreasury.deployed();
  console.log("Business Treasury deployed to:", businessTreasury.address);
  const anyrateTreasury = await Treasury.deploy();
  await anyrateTreasury.deployed();
  console.log("AnyRate Treasury deployed to:", anyrateTreasury.address);

  const Billing = await hre.ethers.getContractFactory("Billing");

  const billing = await Billing.deploy();
  await billing.deployed();
  console.log("Billing deployed to:", billing.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
