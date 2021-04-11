// const fs = require("fs");
const { expect } = require("chai");
require('dotenv').config();
const { TESTNET, INFURA_ID } = process.env;
const getBalance = async (address) => {
  return await ethers.getDefaultProvider(TESTNET, { infura: INFURA_ID }).getBalance(address);
};

before(async () => {
  BillingFactory = await ethers.getContractFactory("BillingFactory");
  // const BillingJSON = fs.readFileSync("artifacts/contracts/Billing.sol/Billing.json", "utf-8");
  // BillingABI = JSON.parse(BillingJSON).abi;
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
    const [account] = ethers.getSigners();
    await account.sendTransaction({ 
      to: ccrf.address,
      value: ethers.utils.parseEther("1.0")
    });
    console.log(await getBalance(bf.address));
    expect((await bf.callAccountBalance("corp", "xo"))).to.eql(ethers.utils.parseEther("1.0"));
  })
  it("Should allow updating the AnyRate Treasury", async () => {
    // await bf.setAnyRateTreasury(ethers.utils.getAddress("0x5A0b54D5dc17e0AadC383d2db43D0a0D3E029c4c"));
    // expect(await bf.anyRateTreasury()).to.eq(ethers.utils.getAddress("0x5A0b54D5dc17e0AadC383d2db43D0a0D3E029c4c"));
  });
  it("Should enable updating the client cost per unit", async () => {
    // await bf.createBilling("corp", 3, "corp.com");
    // await bf.callSetCostPerUnit("corp", 4);
    // const clientBillingAddress = await bf.billingContracts("corp");
    // const clientBilling = new ethers.Contract(BillingABI, clientBillingAddress, ethers.getDefaultProvider());
    // expect((await clientBilling.costPerUnit()).toNumber()).to.eq(4);
  });
});
