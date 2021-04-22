// const fs = require("fs");
const { expect } = require("chai");
require("dotenv").config();

const clientName = "netflix";
const accountName = "a";
const usageURL = "https://anyrate-client-business-api.herokuapp.com/usage";

describe("BillingFactory", () => {
  before(async () => {
    BillingFactory = await ethers.getContractFactory("BillingFactory");
  });

  beforeEach(async () => {
    bf = await BillingFactory.deploy(500);
    await bf.createBilling(clientName, 3, usageURL);
  });

  describe("Basics", async () => {
    it("Should contain a default fee", async () => {
      expect((await bf.anyRateFee()).toNumber()).to.eq(500);
    });

    it("Should contain client business names", async () => {
      expect(await bf.clients(0)).to.eq(clientName);
    });
  });

  describe("AnyRate Admin", async () => {
    it("Update AnyRate Fee", async () => {
      await bf.setAnyRateFee(400);
      expect((await bf.anyRateFee()).toNumber()).to.eq(400);
    });
  });

  describe("User Accounts", async () => {
    it("Should allow deposits to child contracts", async () => {
      // Sending value with transaction
      // is the value forwarded?
      await bf.callDepositTo(clientName, accountName, {
        value: ethers.utils.parseEther("1.0"),
      });
      const [account] = await ethers.getSigners();
      expect(
        (await bf.callAccountBalance(clientName, accountName)).toString()
      ).to.equal(ethers.utils.parseEther("1.0").toString());
    });
  });

  describe("Billing", async () => {
    it("Should bill all customers for a client", async () => {
      await bf.callDepositTo(clientName, accountName, {
        value: ethers.utils.parseEther("1.0"),
      });
      await bf.callBillAll(clientName);
    });
  });
});
