require("dotenv").config();
const { expect } = require("chai");
const { parseEther, formatEther } = ethers.utils;

before(async () => {
  Billing = await ethers.getContractFactory("Billing");
  Treasury = await ethers.getContractFactory("Treasury");
  anyRateFee = 200; // out of 10000; in percentage up to 2dp; e.g. 200 = 2.00%
  costPerUnit = parseEther("0.01");
  usageURL = "corp.com/usage";
  accountName = "LeonardoDaVinci";
  [account] = await ethers.getSigners();
});

beforeEach(async () => {
  aTreasury = await Treasury.deploy("AnyRate");
  bTreasury = await Treasury.deploy("Business");
  billing = await Billing.deploy(
    bTreasury.address,
    aTreasury.address,
    anyRateFee,
    costPerUnit,
    usageURL
  );
});

describe("Billing", () => {
  it("Should receive ether", async () => {
    const sendAmount = parseEther("1");
    await account.sendTransaction({ to: billing.address, value: sendAmount });
    expect(
      (await account.provider.getBalance(billing.address)).toString()
    ).to.eq(sendAmount.toString());
  });

  it("Should have account balances", async () => {
    expect(
      (await billing.accountDetails(accountName)).balance.toString()
    ).to.eq(parseEther("0").toString());
  });

  it("Should receive ether via deposit on behalf of a user account", async () => {
    const depositAmount = parseEther("1");
    await billing.depositTo(accountName, {
      from: account.address,
      value: depositAmount,
    });
    // Expect deposit to add to user's account balance
    expect(
      (await billing.accountDetails(accountName)).balance.toString()
    ).to.eq(depositAmount.toString());
  });

  it("Should remember the address of the depositor", async () => {
    const depositAmount = parseEther("1");
    await billing.depositTo(accountName, {
      from: account.address,
      value: depositAmount,
    });
    expect((await billing.accountDetails(accountName)).knownAddress).to.eq(
      account.address
    );
  });

  it("Should deduct ether on behalf of a user account when billing", async () => {
    const depositAmount = parseEther("1");
    await billing.depositTo(accountName, {
      from: account.address,
      value: depositAmount,
    });
    const usageAmount = parseEther(formatEther("1")); // "1" as BigNumber; 1 wei
    const paymentAmount = usageAmount.mul(costPerUnit);
    await billing.bill(accountName, usageAmount);
    // Expect payment to be deducted from Billing contract balance
    expect(
      (await account.provider.getBalance(billing.address)).toString()
    ).to.eq(depositAmount.sub(paymentAmount).toString());
    // Expect payment to be deducted from user account balance
    expect(
      (await billing.accountDetails(accountName)).balance.toString()
    ).to.eq(depositAmount.sub(paymentAmount).toString());
  });

  it("Should add calculated payment to the business treasury", async () => {
    const depositAmount = parseEther("1");
    await billing.depositTo(accountName, {
      from: account.address,
      value: depositAmount,
    });
    const usageAmount = parseEther(formatEther("1"));
    const paymentAmount = usageAmount.mul(costPerUnit);
    const feeAmount = paymentAmount.mul(anyRateFee).div(10000);

    // console.log("usageAmount: ", await formatEther(usageAmount));
    // console.log("costPerUnit: ", await formatEther(costPerUnit));
    // console.log(
    //   "paymentAmount = usageAmount * costPerUnit: ",
    //   await formatEther(paymentAmount)
    // );
    // console.log("anyRateFee - stored: ", anyRateFee);
    // console.log("anyRateFee - actual: ", anyRateFee / 10000);
    // console.log(
    //   "feeAmount (to anyRateTreasury): ",
    //   await formatEther(feeAmount)
    // );
    // console.log(
    //   "paymentAmount - fee (to clientTreasury): ",
    //   await formatEther(paymentAmount.sub(feeAmount))
    // );

    await billing.bill(accountName, usageAmount);
    // Expect payment - fee to be added to the business treasury balance
    expect(
      (await account.provider.getBalance(bTreasury.address)).toString()
    ).to.eq(paymentAmount.sub(feeAmount).toString());
  });

  it("Should add calculated fee to the AnyRate treasury", async () => {
    const depositAmount = parseEther("1");
    await billing.depositTo(accountName, {
      from: account.address,
      value: depositAmount,
    });
    const usageAmount = parseEther(formatEther("1"));
    const paymentAmount = usageAmount.mul(costPerUnit);
    const feeAmount = paymentAmount.mul(anyRateFee).div(10000);
    await billing.bill(accountName, usageAmount);
    // Expect fee to be added to the AnyRate treasury balance
    expect(
      (await account.provider.getBalance(aTreasury.address)).toString()
    ).to.eq(feeAmount.toString());
  });
});
