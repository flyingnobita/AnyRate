const { expect } = require("chai");

describe("Billing", function() {
  it("Should receive ether", async function() {
    const Treasury = await ethers.getContractFactory("Treasury");
    const aTreasury = await Treasury.deploy("AnyRate");
    const bTreasury = await Treasury.deploy("Business");
    
    const Billing = await ethers.getContractFactory("Billing");
    const billing = await Billing.deploy(aTreasury.address, bTreasury.address, 1000);

    const account = (await ethers.getSigners())[0];
    let initialBillingBalance = await account.provider.getBalance(billing.address);

    await account.sendTransaction({ to: billing.address, value: ethers.utils.parseEther('1.0') });

    let newBillingBalance = await account.provider.getBalance(billing.address);

    expect(newBillingBalance - initialBillingBalance === ethers.utils.parseEther('1.0'));
  })
});
