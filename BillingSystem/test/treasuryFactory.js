const { expect } = require("chai");

describe("TreasuryFactory", function() {
  it("Should be able to create a named treasury", async () => {
    const TreasuryFactory = await ethers.getContractFactory("TreasuryFactory");
    const treasuryFactory = await TreasuryFactory.deploy();
    await treasuryFactory.deployed();
    await treasuryFactory.createTreasury("FactoryTest");
    await treasuryFactory.treasuries("FactoryTest");
    const name = await treasuryFactory.callName("FactoryTest");
    expect(name).to.eq("FactoryTest");
  });
});
