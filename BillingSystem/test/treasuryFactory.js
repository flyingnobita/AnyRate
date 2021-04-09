const { expect } = require("chai");

describe("TreasuryFactory", function() {
  it("Should be able to create a treasury", async function() {
    const TreasuryFactory = await ethers.getContractFactory("TreasuryFactory");
    const treasuryFactory = await TreasuryFactory.deploy();
    await treasuryFactory.deployed();

    await treasuryFactory.createTreasury("FactoryTest");
    const factoryTest = await treasuryFactory.treasuries("FactoryTest");
    console.log(factoryTest);
    const name = await treasuryFactory.callName("FactoryTest");
    console.log(name);
    expect(name).to.eq("FactoryTest");
  });
});
