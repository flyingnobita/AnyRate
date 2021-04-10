const { expect } = require("chai");

describe("Treasury", function() {
  it("Should be named", async function() {
    const Treasury = await ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy("AnyRate");
    await treasury.deployed();

    expect(await treasury.name()).to.eq("AnyRate");
  });
  it("Should receive ether", async function() {
    const Treasury = await ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy("AnyRate");
    
    const account = (await ethers.getSigners())[0];
    let initialTreasuryBalance = await account.provider.getBalance(treasury.address);

    await account.sendTransaction({ to: treasury.address, value: ethers.utils.parseEther('1.0') });

    let newTreasuryBalance = await account.provider.getBalance(treasury.address);

    expect(newTreasuryBalance.sub(initialTreasuryBalance)).to.eq(ethers.utils.parseEther('1.0'));
  })
});
