const { expect } = require("chai");

before(async () => {
  TreasuryFactory = await ethers.getContractFactory("TreasuryFactory");
  treasuryFactory = await TreasuryFactory.deploy();
  [accountOne, accountTwo] = await ethers.getSigners();
  treasuryName = "Gumbles";
});

describe("TreasuryFactory", function () {
  it("Should be able to create a named treasury", async () => {
    await treasuryFactory.createTreasury(treasuryName);
    expect(await treasuryFactory.callName(treasuryName)).to.eq(treasuryName);
  });

  it("Should reveal the balance of a treasury by name", async () => {
    await treasuryFactory.createTreasury(treasuryName);
    const treasury = await treasuryFactory.treasuries(treasuryName);
    await accountOne.sendTransaction({
      to: treasury,
      value: ethers.utils.parseEther("10.0"),
    });
    expect((await treasuryFactory.balanceOf(treasuryName)).toString()).to.eq(
      ethers.utils.parseEther("10.0").toString()
    );
  });

  it("Should allow clients to transfer value out of their treasuries", async () => {
    await treasuryFactory.createTreasury(treasuryName);
    const treasury = await treasuryFactory.treasuries(treasuryName);
    await accountOne.sendTransaction({
      to: treasury,
      value: ethers.utils.parseEther("10.0"),
    });
    await treasuryFactory.callTransferTo(
      treasuryName,
      accountTwo.address,
      ethers.utils.parseEther("1.0")
    );
    expect((await treasuryFactory.balanceOf(treasuryName)).toString()).to.eq(
      ethers.utils.parseEther("9.0").toString()
    );
  });
});
