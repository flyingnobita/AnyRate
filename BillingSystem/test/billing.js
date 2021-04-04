const { expect } = require("chai");

describe("Billing", function() {
  it("Should receive ether", async function() {
    const Treasury = await ethers.getContractFactory("Treasury");
    const aTreasury = await Treasury.deploy("AnyRate");
    const bTreasury = await Treasury.deploy("Business");
    
    const Billing = await ethers.getContractFactory("Billing");
    const billing = await Billing.deploy(aTreasury.address, bTreasury.address, 1000, 100);

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
    const billing = await Billing.deploy(aTreasury.address, bTreasury.address, 1000, 100);
  
    const accountName = "LeonardoDaVinci";
  
    expect(await billing.accountBalances(accountName)).to.eq(0);
  });
  it("Should receive ether via deposit on behalf of a user account", async function() {
    const Treasury = await ethers.getContractFactory("Treasury");
    const aTreasury = await Treasury.deploy("AnyRate");
    const bTreasury = await Treasury.deploy("Business");
    
    const Billing = await ethers.getContractFactory("Billing");
    const billing = await Billing.deploy(aTreasury.address, bTreasury.address, 1000, 100);

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
  it("Should deduct ether on behalf of a user account when billing", async function() {
    const Treasury = await ethers.getContractFactory("Treasury");
    const aTreasury = await Treasury.deploy("AnyRate");
    const bTreasury = await Treasury.deploy("Business");
    
    const Billing = await ethers.getContractFactory("Billing");
    const anyRateFee = 1000; // Expressed as reciprocal of decimal; this is 0.001
    const costPerUnit = 100; // Same as above; this means 0.01
    const billing = await Billing.deploy(bTreasury.address, aTreasury.address, anyRateFee, costPerUnit);

    const account = (await ethers.getSigners())[0];
    const accountName = "LeonardoDaVinci";
    const depositAmount = ethers.utils.parseEther('1.0');
    await billing.depositTo(accountName, {
      from: account.address,
      value: depositAmount
    });
    expect(await billing.accountBalances(accountName)).to.eq(depositAmount);
    expect(await account.provider.getBalance(billing.address)).to.eq(depositAmount);

    const usageAmount = ethers.utils.parseEther('1');
    const paymentAmount = usageAmount.div(costPerUnit);
    console.log("Payment", paymentAmount);
    const feeAmount = paymentAmount.div(anyRateFee);
    console.log("Fee", feeAmount);

    await billing.bill(accountName, usageAmount);
    // Expect payment + fee to be deducted from Billing contract balance
    expect(await account.provider.getBalance(billing.address)).to.eq(depositAmount.sub(paymentAmount.add(feeAmount)));
    // Expect payment + fee to be deducted from user account balance
    expect(await billing.accountBalances(accountName)).to.eq(depositAmount.sub(paymentAmount.add(feeAmount)));
  });
  it("Should add calculated payment to the business treasury", async function() {
    const Treasury = await ethers.getContractFactory("Treasury");
    const aTreasury = await Treasury.deploy("AnyRate");
    const bTreasury = await Treasury.deploy("Business");
    
    const Billing = await ethers.getContractFactory("Billing");
    const anyRateFee = 1000; // Expressed as reciprocal of decimal; this is 0.001
    const costPerUnit = 100; // Same as above; this means 0.01
    const billing = await Billing.deploy(bTreasury.address, aTreasury.address, anyRateFee, costPerUnit);

    const account = (await ethers.getSigners())[0];
    const accountName = "LeonardoDaVinci";
    const depositAmount = ethers.utils.parseEther('1.0');
    await billing.depositTo(accountName, {
      from: account.address,
      value: depositAmount
    });
    expect(await billing.accountBalances(accountName)).to.eq(depositAmount);
    expect(await account.provider.getBalance(billing.address)).to.eq(depositAmount);

    const usageAmount = ethers.utils.parseEther('1');
    const paymentAmount = usageAmount.div(costPerUnit);
    console.log("Payment", paymentAmount);

    await billing.bill(accountName, usageAmount);
    // Expect payment to be added to the business treasury balance
    expect(await account.provider.getBalance(bTreasury.address)).to.eq(paymentAmount);

  });
  it("Should add calculated fee to the AnyRate treasury", async function() {
    const Treasury = await ethers.getContractFactory("Treasury");
    const aTreasury = await Treasury.deploy("AnyRate");
    const bTreasury = await Treasury.deploy("Business");
    
    const Billing = await ethers.getContractFactory("Billing");
    const anyRateFee = 1000; // Expressed as reciprocal of decimal; this is 0.001
    const costPerUnit = 100; // Same as above; this means 0.01
    const billing = await Billing.deploy(bTreasury.address, aTreasury.address, anyRateFee, costPerUnit);

    const account = (await ethers.getSigners())[0];
    const accountName = "LeonardoDaVinci";
    const depositAmount = ethers.utils.parseEther('1.0');
    await billing.depositTo(accountName, {
      from: account.address,
      value: depositAmount
    });
    expect(await billing.accountBalances(accountName)).to.eq(depositAmount);
    expect(await account.provider.getBalance(billing.address)).to.eq(depositAmount);

    const usageAmount = ethers.utils.parseEther('1');
    const paymentAmount = usageAmount.div(costPerUnit);
    const feeAmount = paymentAmount.div(anyRateFee);
    console.log("Fee", feeAmount);

    await billing.bill(accountName, usageAmount);
    // Expect fee to be added to the AnyRate treasury balance
    expect(await account.provider.getBalance(aTreasury.address)).to.eq(feeAmount);
  });
});
