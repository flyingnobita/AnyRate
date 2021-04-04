const { expect } = require("chai");

describe("Treasury", function() {
  it("Should be named", async function() {
    const Treasury = await ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy("AnyRate");
    await treasury.deployed();

    expect(await treasury.name()).to.equal("AnyRate");
  });
});
