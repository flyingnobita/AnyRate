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

    await billing.bill(accountName, usageAmount);
    // Expect payment to be deducted from Billing contract balance
    expect(await account.provider.getBalance(billing.address)).to.eq(depositAmount.sub(paymentAmount));
    // Expect payment to be deducted from user account balance
    expect(await billing.accountBalances(accountName)).to.eq(depositAmount.sub(paymentAmount));
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
    const feeAmount = paymentAmount.div(anyRateFee);
    console.log("Fee", feeAmount);

    await billing.bill(accountName, usageAmount);
    // Expect payment - fee to be added to the business treasury balance
    expect(await account.provider.getBalance(bTreasury.address)).to.eq(paymentAmount.sub(feeAmount));

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
  it("Should bill all users in accounts and usages arrays", async function() {
    const Treasury = await ethers.getContractFactory("Treasury");
    const aTreasury = await Treasury.deploy("AnyRate");
    const bTreasury = await Treasury.deploy("Business");
    
    const Billing = await ethers.getContractFactory("Billing");
    const anyRateFee = 1000; // Expressed as reciprocal of decimal; this is 0.001
    const costPerUnit = 100; // Same as above; this means 0.01
    const billing = await Billing.deploy(bTreasury.address, aTreasury.address, anyRateFee, costPerUnit);
    
    const depositAmount = ethers.utils.parseEther('1.0');
    const accounts = await ethers.getSigners();

    // Create accounts in Billing contract, use 'i' as name and usage amount
    let accountNames = [];
    let usages = [];
    let totalDeposited = ethers.utils.parseEther('0');
    for (let i = 0; i < 10; i++) {
      let name = i.toString();
      accountNames.push(name);
      usages.push(ethers.utils.parseEther(i.toString()));
      await billing.depositTo(name, {
        from: accounts[0].address,
        value: depositAmount
      });
      totalDeposited = totalDeposited.add(depositAmount);
    }
    console.log('checking total deposited');
    expect(await accounts[0].provider.getBalance(billing.address)).to.eq(totalDeposited);
    
    // Tally the totals expected in each treasury after billing all accounts
    let totalPayments = ethers.utils.parseEther('0');
    let totalFees = ethers.utils.parseEther('0');
    for (let i = 0; i < accountNames.length; i++) {
      let usageAmount = usages[i];
      let paymentAmount = usageAmount.div(costPerUnit);
      let feeAmount = paymentAmount.div(anyRateFee);
      
      totalPayments = totalPayments.add(paymentAmount);
      totalFees = totalFees.add(feeAmount);
    }
    
    // Bill all accounts
    await billing.billAll(accountNames, usages);
    
    // Expect total fees to be in the AnyRate treasury balance
    console.log('checking total fees');
    expect(await accounts[0].provider.getBalance(aTreasury.address)).to.eq(totalFees);
    // Expect total payments to be in business treasury balance
    console.log('checking total payments minus fees');
    expect(await accounts[0].provider.getBalance(bTreasury.address)).to.eq(totalPayments.sub(totalFees));
  });
});
