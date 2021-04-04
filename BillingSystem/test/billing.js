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
    expect(initialBillingBalance).to.eq(0);

    const sendAmount = ethers.utils.parseEther('1.0');
    console.log("Sending ether to Billing contract: ", sendAmount);
    await account.sendTransaction({ to: billing.address, value: sendAmount });

    let newBillingBalance = await account.provider.getBalance(billing.address);

    expect(newBillingBalance).to.eq(sendAmount);
  });
  it("Should have account balances", async function() {
    const Treasury = await ethers.getContractFactory("Treasury");
    const aTreasury = await Treasury.deploy("AnyRate");
    const bTreasury = await Treasury.deploy("Business");
    
    const Billing = await ethers.getContractFactory("Billing");
    const billing = await Billing.deploy(aTreasury.address, bTreasury.address, 1000);
  
    const accountName = "LeonardoDaVinci";
  
    expect(await billing.accountBalances(accountName)).to.eq(0);
  });
  it("Should receive ether via deposit on behalf of a user account", async function() {
    const Treasury = await ethers.getContractFactory("Treasury");
    const aTreasury = await Treasury.deploy("AnyRate");
    const bTreasury = await Treasury.deploy("Business");
    
    const Billing = await ethers.getContractFactory("Billing");
    const billing = await Billing.deploy(aTreasury.address, bTreasury.address, 1000);

    const account = (await ethers.getSigners())[0];
    const accountName = "LeonardoDaVinci";
    expect(await account.provider.getBalance(billing.address)).to.eq(0);
    expect(await billing.accountBalances(accountName)).to.eq(0);

    const depositAmount = ethers.utils.parseEther('1.0');
    await billing.depositTo(accountName, {
      from: account.address,
      value: depositAmount
    });

    // Expect deposit to add to Billing contract balance
    expect(await account.provider.getBalance(billing.address)).to.eq(depositAmount);
    // Expect deposit to add to user's account balance
    const accountNewBalance = await billing.accountBalances(accountName);
    console.log(`Account ${accountName} has balance ${accountNewBalance}`);
    expect(accountNewBalance).to.eq(depositAmount);
  });
});
