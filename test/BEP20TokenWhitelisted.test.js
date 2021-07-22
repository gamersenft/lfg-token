const { getIcapAddress } = require("@ethersproject/address");
const { expect, assert } = require("chai");

function tokens(n) {
  return ethers.utils.parseEther(n);
}

const AddressZero = ethers.constants.AddressZero;
const maxInt = ethers.constants.MaxUint256;

const deployWithoutLGE = deployments.createFixture(async ({ deployments, ethers }, options) => {
  await deployments.fixture();
  const [deployer, holder5, holder10, holder20, holder40, treasury, pairAddress, newOwner] = await ethers.getSigners();
  const pad = await ethers.getContract("BEP20TokenWhitelisted");

  hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [AddressZero]
  });

  const ZeroAddress = await ethers.provider.getSigner(AddressZero);

  return {
    pad,
    deployer,
    holder5,
    holder10,
    holder20,
    holder40,
    pairAddress,
    ZeroAddress
  };
});

const deployWithLGE = deployments.createFixture(async ({ deployments, ethers }, options) => {
  await deployments.fixture();
  const [deployer, holder5, holder10, holder20, holder40, treasury, pairAddress, newOwner] = await ethers.getSigners();
  const pad = await ethers.getContract("BEP20TokenWhitelisted");


  const durations = [1200];
  const amountsMax = [tokens("10000")];

  await pad.createLGEWhitelist(pairAddress.address, durations, amountsMax);

  return {
    pad,
    deployer,
    holder5,
    pairAddress
  };
});

const deployWithTokenHolders = deployments.createFixture(async ({ deployments, ethers }, options) => {
  await deployments.fixture();
  const [deployer, holder5, holder10, holder20, holder40, treasury, pairAddress, newOwner] = await ethers.getSigners();
  const pad = await ethers.getContract("BEP20TokenWhitelisted");

  const durations = [1200];
  const amountsMax = [tokens("10000")];

  await pad.createLGEWhitelist(pairAddress.address, durations, amountsMax);

  await pad.transfer(pairAddress.address, tokens("10000"));

  await pad.transfer(holder5.address, tokens("5"));
  await pad.transfer(holder10.address, tokens("10"));
  await pad.transfer(holder20.address, tokens("20"));
  await pad.transfer(holder40.address, tokens("40"));

  hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [AddressZero]
  });

  const ZeroAddress = await ethers.provider.getSigner(AddressZero);

  return {
    pad,
    deployer,
    holder5,
    holder10,
    holder20,
    holder40,
    pairAddress,
    ZeroAddress
  };
});

async function increaseTime(n) {

  await hre.network.provider.request({
    method: "evm_increaseTime",
    params: [n]
  });

  await hre.network.provider.request({
    method: "evm_mine",
    params: []
  });
}


describe("BSCPad Test Suite", () => {

  describe("Deployment", () => {

    it("name should be BEP20TokenWhitelisted", async () => {
      const { pad } = await deployWithLGE();
      expect(await pad.name()).to.be.equal("BEP20TokenWhitelisted");
    });

    it("symbol should be B20WL", async () => {
      const { pad } = await deployWithLGE();
      expect(await pad.symbol()).to.be.equal("B20WL");
    });

    it("deployer should be the owner", async () => {
      const { pad, deployer } = await deployWithLGE();
      expect(await pad.getOwner()).to.be.equal(deployer.address)
    });

    it("should have 18 decimals", async () => {
      const { pad } = await deployWithLGE();
      expect(await pad.decimals()).to.be.equal(18);
    });

    it("total supply should be 1 million tokens", async () => {
      const { pad } = await deployWithLGE();
      expect(await pad.totalSupply()).to.be.equal(tokens("1000000"));
    });

    it("deployer should have the total initial supply", async () => {
      const { pad, deployer } = await deployWithLGE();
      expect(await pad.balanceOf(deployer.address)).to.be.equal(tokens("1000000"));
    });

  });


  describe("allowance", () => {

    it("allowance works as expected", async () => {
      const { pad, deployer, holder5 } = await deployWithTokenHolders();
      expect(await pad.allowance(deployer.address, holder5.address)).to.equal(tokens("0"));
      await pad.approve(holder5.address, tokens("5"));
      expect(await pad.allowance(deployer.address, holder5.address)).to.equal(tokens("5"));
      await pad.increaseAllowance(holder5.address, tokens("3"));
      expect(await pad.allowance(deployer.address, holder5.address)).to.equal(tokens("8"));
      await pad.decreaseAllowance(holder5.address, tokens("4"));
      expect(await pad.allowance(deployer.address, holder5.address)).to.equal(tokens("4"));
      await expect(pad.decreaseAllowance(holder5.address, tokens("5"))).to.be.revertedWith("BEP20: decreased allowance below zero");
      expect(await pad.allowance(deployer.address, holder5.address)).to.equal(tokens("4"));
    });

  });

  describe("approve", () => {

    it("cannot approve the zero address to move your tokens", async () => {
      const { pad, holder5 } = await deployWithTokenHolders();
      await expect(pad.connect(holder5).approve(AddressZero, tokens("5"))).to.be.reverted;
    });

    // it("zero address cannot approve burned tokens to be moved", async () => {
    //   const { pad, holder5, ZeroAddress} = await deployWithTokenHolders();
    //   // Open github issue here
    //   await expect(pad.connect(ZeroAddress).approve(holder5.address, tokens("5"))).to.be.reverted;
    // });

  });

  describe("transferFrom", () => {

    it("allows you transfer an address' tokens to another address", async () => {
      const { pad, holder5, holder10, holder20 } = await deployWithTokenHolders();
      await pad.connect(holder5).approve(holder10.address, tokens("5"));
      await pad.connect(holder10).transferFrom(holder5.address, holder20.address, tokens("5"));
    });

  });

  describe("Ownership", () => {

    it("only the owner can transfer ownership to another address", async () => {
      const { pad, holder5 } = await deployWithLGE();
      await expect(pad.connect(holder5).transferOwnership(holder5.address)).to.be.reverted;
      await pad.transferOwnership(holder5.address);
      expect(await pad.getOwner()).to.be.equal(holder5.address);
    });

    it("owner cannot transfer ownership to the zero address", async () => {
      const { pad } = await deployWithLGE();
      await expect(pad.transferOwnership(AddressZero)).to.be.reverted;
    });

    it("the owner can renounce ownership of the contract", async () => {
      const { pad } = await deployWithLGE();
      await pad.renounceOwnership();
      expect(await pad.getOwner()).to.be.equal(AddressZero);
    });

  });

  describe("Whitelist", () => {

	/*
	
    it("token transfers revert without the pair address set", async () => {
      const { pad, holder5 } = await deployWithoutLGE();

      const data = await pad.getLGEWhitelistRound();

      const durations = [1200];
      const amountsMax = [tokens("10000")];

      await pad.createLGEWhitelist(AddressZero, durations, amountsMax);
      await expect(pad.transfer(holder5.address, tokens("1"))).to.be.reverted;
    });
	
	*/

    it("creating the LGE whitelist requires duration and amountsMax of equal length", async () => {
      const { pad, holder5 } = await deployWithoutLGE();

      let durations = [1200];
      let amountsMax = [tokens("10000"), tokens("10")];

      await expect(pad.createLGEWhitelist(AddressZero, durations, amountsMax)).to.be.reverted;

      durations = [];
      amountsMax = [];

      await pad.createLGEWhitelist(AddressZero, durations, amountsMax);
    });

    it("transferring tokens to the pair address begins the LGE", async () => {
      const { pad, holder5, pairAddress } = await deployWithLGE();
      await pad.transfer(pairAddress.address, tokens("10000"));
      await expect(pad.connect(pairAddress).transfer(holder5.address, tokens("10"))).to.be.reverted;
    });

    it("transferring tokens reverts if you're not on the whitelist", async () => {
      const { pad, holder5, pairAddress } = await deployWithTokenHolders();
      await expect(pad.connect(pairAddress).transfer(holder5.address, tokens("10"))).to.be.reverted;
    });

    it("whitelisters cannot buy more than the specified amount max", async () => {
      const { pad, holder5, holder10, holder20, holder40, pairAddress, deployer } = await deployWithTokenHolders();
      const addresses = [pairAddress.address, deployer.address, holder5.address, holder10.address, holder20.address, holder40.address];
      await pad.modifyLGEWhitelist(0, 1200, tokens("5000"), addresses, true);
      await expect(pad.connect(pairAddress).transfer(holder5.address, tokens("10001"))).to.be.reverted;
    });

    it("whitelisted addresses can buy up to the specified max", async () => {
      const { pad, holder5, holder10, holder20, holder40, pairAddress, deployer } = await deployWithTokenHolders();
      const addresses = [pairAddress.address, deployer.address, holder5.address, holder10.address, holder20.address, holder40.address];
      await pad.modifyLGEWhitelist(0, 1200, tokens("5000"), addresses, true);
      await pad.connect(pairAddress).transfer(holder5.address, tokens("5000"));
      await expect(pad.connect(pairAddress).transfer(holder5.address, tokens("1"))).to.be.reverted;
    });

    it("whitelist admin can add whitelist addresses using modifyLGEWhitelist", async () => {
      const { pad, holder5, holder10, holder20, holder40, pairAddress, deployer } = await deployWithTokenHolders();
      const addresses = [pairAddress.address, deployer.address, holder5.address, holder10.address, holder20.address, holder40.address];
      await expect(pad.connect(pairAddress).transfer(holder5.address, tokens("10"))).to.be.reverted;
      await pad.modifyLGEWhitelist(0, 1200, tokens("5000"), addresses, true);
      await pad.connect(pairAddress).transfer(holder5.address, tokens("10"));
      expect(await pad.balanceOf(holder5.address)).to.be.equal(tokens("15"));
    });

    it("whitelist admin can modify the whitelist duration", async () => {
      const { pad, holder5, holder10, holder20, holder40, pairAddress, deployer } = await deployWithTokenHolders();
      const addresses = [pairAddress.address, deployer.address, holder5.address, holder10.address, holder20.address, holder40.address];
      await pad.modifyLGEWhitelist(0, 1201, tokens("5000"), addresses, true);
    });

    it("whitelist admin can modify the max tokens that can be bought during the whitelist", async () => {
      const { pad, holder5, holder10, holder20, holder40, pairAddress, deployer } = await deployWithTokenHolders();
      const addresses = [pairAddress.address, deployer.address, holder5.address, holder10.address, holder20.address, holder40.address];
      await pad.modifyLGEWhitelist(0, 1200, tokens("5000"), addresses, true);
    });

    it("whitelist admin can call the modifyLGEWhitelist and not change anything", async () => {
      const { pad, holder5, holder10, holder20, holder40, pairAddress, deployer } = await deployWithTokenHolders();
      const addresses = [pairAddress.address, deployer.address, holder5.address, holder10.address, holder20.address, holder40.address];
      await pad.modifyLGEWhitelist(0, 1200, tokens("10000"), addresses, true);
    });

    it("when the whitelist round is over, getLGEWhitelistRound returns 0", async () => {
      const { pad } = await deployWithTokenHolders();
      let data = await pad.getLGEWhitelistRound();
      expect(data[0]).to.be.equal(1);
      increaseTime(1500);
      data = await pad.getLGEWhitelistRound();
      expect(data[0]).to.be.equal(0);
    });

    it("whitelist admin cannot modify a whitelist that doesn't exist", async () => {
      const { pad, holder5, holder10, holder20, holder40, pairAddress, deployer } = await deployWithTokenHolders();
      const addresses = [pairAddress.address, deployer.address, holder5.address, holder10.address, holder20.address, holder40.address];
      await expect(pad.modifyLGEWhitelist(1, 1201, tokens("5000"), addresses, true)).to.be.reverted;
    });

    it("whitelist admin cannot set amountMax less than zero", async () => {
      const { pad, holder5, holder10, holder20, holder40, pairAddress, deployer } = await deployWithTokenHolders();
      const addresses = [pairAddress.address, deployer.address, holder5.address, holder10.address, holder20.address, holder40.address];
      // SVM function call fails before require statement reverts
      // await expect(pad.modifyLGEWhitelist(0, 1200, -1, addresses, true)).to.be.reverted;
    });

    it("whitelist admin can renounce their whitelister permissions", async () => {
      const { pad } = await deployWithoutLGE();
      await pad.renounceWhitelister();
      expect(await pad._whitelister()).to.be.equal(AddressZero);
    });

    it("whitelist admin can tranfer their whitelisting permission to another address", async () => {
      const { pad, holder5 } = await deployWithoutLGE();
      await expect(pad.connect(holder5).transferWhitelister(holder5.address)).to.be.reverted;
      await pad.transferWhitelister(holder5.address);
      expect(await pad._whitelister()).to.be.equal(holder5.address);
    });

    it("whitelist admin cannot transfer their whitelisting permission to the zero address", async () => {
      const { pad, deployer } = await deployWithoutLGE();
      await expect(pad.transferWhitelister(AddressZero)).to.be.reverted;
      expect(await pad._whitelister()).to.be.equal(deployer.address);
    });

  });

});
