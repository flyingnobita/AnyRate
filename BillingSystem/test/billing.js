require('dotenv').config();
const { expect } = require("chai");
const { TESTNET, INFURA_ID } = process.env;
const { parseEther } = ethers.utils;

before(async () => {
  Billing = await ethers.getContractFactory("Billing");
  Treasury = await ethers.getContractFactory("Treasury");
  aTreasury = await Treasury.deploy("AnyRate");
  bTreasury = await Treasury.deploy("Business");
  await aTreasury.deployed();
  await bTreasury.deployed();
  anyRateFee = 1000; // Expressed as reciprocal of decimal; this is 0.001
  costPerUnit = 100; // Same as above; this means 0.01
  usageURL = "corp.com/usage";
  accountName = "LeonardoDaVinci";
  [account] = await ethers.getSigners();
});

beforeEach(async () => {
  billing = await Billing.deploy(aTreasury.address, bTreasury.address, anyRateFee, costPerUnit, usageURL);
});

describe("Billing", () => {
  it("Should receive ether", async () => {
    let initialBillingBalance = await account.provider.getBalance(billing.address);
    console.log("initial account balance: ", await account.provider.getBalance(account.address));
    expect(initialBillingBalance).to.eql(parseEther("0"));

    const sendAmount = parseEther("1");
    console.log("Sending ether to Billing contract: ", sendAmount);
    await account.sendTransaction({ to: billing.address, value: sendAmount });

    let newBillingBalance = await account.provider.getBalance(billing.address);

    expect(newBillingBalance).to.eql(sendAmount);
  });
  it("Should have account balances", async () => {
    expect((await billing.accountDetails(accountName)).balance).to.eql(parseEther("0"));
  });
  it("Should receive ether via deposit on behalf of a user account", async () => {
    expect(await account.provider.getBalance(billing.address)).to.eq(parseEther("0"));
    expect((await billing.accountDetails(accountName)).balance).to.eq(parseEther("0"));

    const depositAmount = parseEther("1");
    await billing.depositTo(accountName, {
      from: account.address,
      value: depositAmount
    });

    // Expect deposit to add to Billing contract balance
    expect(await account.provider.getBalance(billing.address)).to.eq(depositAmount);
    // Expect deposit to add to user's account balance
    const accountNewBalance = (await billing.accountDetails(accountName)).balance;
    console.log(`Account ${accountName} has balance ${accountNewBalance}`);
    expect(accountNewBalance).to.eq(depositAmount);
  });
  it("Should deduct ether on behalf of a user account when billing", async () => {
    const depositAmount = parseEther("1");
    await billing.depositTo(accountName, {
      from: account.address,
      value: depositAmount
    });
    expect((await billing.accountDetails(accountName)).balance).to.eq(depositAmount);
    expect(await account.provider.getBalance(billing.address)).to.eq(depositAmount);

    const usageAmount = parseEther('1');
    const paymentAmount = usageAmount.div(costPerUnit);
    console.log("Payment", paymentAmount);

    await billing.bill(accountName, usageAmount);
    // Expect payment to be deducted from Billing contract balance
    expect(await account.provider.getBalance(billing.address)).to.eq(depositAmount.sub(paymentAmount));
    // Expect payment to be deducted from user account balance
    expect((await billing.accountDetails(accountName)).balance).to.eq(depositAmount.sub(paymentAmount));
  });
  it("Should add calculated payment to the business treasury", async () => {
    const depositAmount = parseEther("1");
    await billing.depositTo(accountName, {
      from: account.address,
      value: depositAmount
    });
    expect((await billing.accountDetails(accountName)).balance).to.eq;(depositAmount);
    expect(await account.provider.getBalance(billing.address)).to.eq(depositAmount);

    const usageAmount = parseEther('1');
    const paymentAmount = usageAmount.div(costPerUnit);
    console.log("Payment", paymentAmount);
    const feeAmount = paymentAmount.div(anyRateFee);
    console.log("Fee", feeAmount);

    await billing.bill(accountName, usageAmount);
    // Expect payment - fee to be added to the business treasury balance
    expect(await account.provider.getBalance(bTreasury.address)).to.eq(paymentAmount.sub(feeAmount));

  });
  it("Should add calculated fee to the AnyRate treasury", async () => {
    const depositAmount = parseEther("1");
    await billing.depositTo(accountName, {
      from: account.address,
      value: depositAmount
    });
    expect((await billing.accountDetails(accountName)).balance).to.eq(depositAmount);
    expect(await account.provider.getBalance(billing.address)).to.eq(depositAmount);

    const usageAmount = parseEther('1');
    const paymentAmount = usageAmount.div(costPerUnit);
    const feeAmount = paymentAmount.div(anyRateFee);
    console.log("Fee", feeAmount);

    await billing.bill(accountName, usageAmount);
    // Expect fee to be added to the AnyRate treasury balance
    expect(await account.provider.getBalance(aTreasury.address)).to.eq(feeAmount);
  });
});
