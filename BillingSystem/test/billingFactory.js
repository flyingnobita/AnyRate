// const fs = require("fs");
const { expect  } = require("chai");
require('dotenv').config();

before(async () => {
  BillingFactory = await ethers.getContractFactory("BillingFactory");
});

beforeEach(async () => {
  bf = await BillingFactory.deploy(500);
});

describe("BillingFactory", () => {
  it("Should contain a default fee", async () => {
    expect((await bf.anyRateFee()).toNumber()).to.eq(500);
  });
  it("Should contain client business names", async () => {
    await bf.createBilling("corp", 3, "corp.com");
    expect((await bf.clients(0))).to.eq("corp");
  });
  it("Should enable updating the fee", async () => {
    await bf.createBilling("corp", 3, "corp.com");
    await bf.setAnyRateFee(400);
    expect((await bf.anyRateFee()).toNumber()).to.eq(400);
  });
  it("Should allow deposits to child contracts", async () => {
    await bf.createBilling("corp", 3, "corp.com");
    // Sending value with transaction
    // is the value forwarded?
    await bf.callDepositTo("corp", "xo", { value: ethers.utils.parseEther("1.0") });
    const [account] = await ethers.getSigners();
    expect((await bf.callAccountBalance("corp", "xo")).toString()).to.equal(ethers.utils.parseEther("1.0").toString());
  });
});
