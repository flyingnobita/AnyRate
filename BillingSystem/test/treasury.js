const { expect } = require("chai");

before(async () => {
  Treasury = await ethers.getContractFactory("Treasury");
  [signer] = await ethers.getSigners();
});

beforeEach(async () => {
  treasury = await Treasury.deploy("AnyRate");
  [accountOne, accountTwo] = await ethers.getSigners();
});

describe("Treasury", function () {
  it("Should be named", async function () {
    expect(await treasury.name()).to.eq("AnyRate");
  });

  it("Should receive ether", async function () {
    await signer.sendTransaction({
      to: treasury.address,
      value: ethers.utils.parseEther("1.0"),
    });
    expect(
      (await signer.provider.getBalance(treasury.address)).toString()
    ).to.eq(ethers.utils.parseEther("1.0").toString());
  });

  it("Should allow withdrawals from owner", async function () {
    await signer.sendTransaction({
      to: treasury.address,
      value: ethers.utils.parseEther("1.0"),
    });
    expect(
      (await signer.provider.getBalance(treasury.address)).toString()
    ).to.eq(ethers.utils.parseEther("1").toString());
    await treasury.withdrawAll();
    expect(
      (await signer.provider.getBalance(treasury.address)).toString()
    ).to.eq(ethers.utils.parseEther("0").toString());
  });

  it("Should not allow withdrawals from non-owner", async function () {
    try {
      await signer.sendTransaction({
        to: treasury.address,
        value: ethers.utils.parseEther("1.0"),
      });
      expect(
        (await signer.provider.getBalance(treasury.address)).toString()
      ).to.eq(ethers.utils.parseEther("1.0").toString());
      const treasuryAsAccountTwo = treasury.connect(accountTwo);
      await treasuryAsAccountTwo.withdrawAll();
    } catch (err) {}
    expect(
      (await signer.provider.getBalance(treasury.address)).toString()
    ).to.eq(ethers.utils.parseEther("1.0").toString());
  });
});
