import { expect } from "chai";
import { ethers, network, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, BigNumberish, Contract } from "ethers";
import { LFGMasterChefContract, LFGTokenContract } from "../types/contracts";

let owner: SignerWithAddress;
let owner1: SignerWithAddress;
let owner2: SignerWithAddress;
let users: SignerWithAddress[];
let chef: Contract;

let lfgToken: Contract;
let testToken1: Contract;
let testToken2: Contract;

async function reDeploy() {
  [owner, ...users] = await ethers.getSigners();
  let TokenFactory = await ethers.getContractFactory("LFGToken");
  lfgToken = await TokenFactory.deploy(
    "LFG Token",
    "LFG",
    ethers.utils.parseEther("100000"),
    owner.address
  );
  testToken1 = await TokenFactory.deploy(
    "testToken1",
    "TST1",
    ethers.utils.parseEther("100000"),
    owner.address
  );
  testToken2 = await TokenFactory.deploy(
    "testToken2",
    "TST2",
    ethers.utils.parseEther("100000"),
    owner.address
  );

  let MasterChef = await ethers.getContractFactory("LFGMasterChef");
  chef = await upgrades.deployProxy(MasterChef, [
    lfgToken.address,
    owner.address,
    owner.address,
    0,
    ethers.utils.parseEther("0.5"),
    owner.address,
  ]);
}

describe("LFGMasterChef test", () => {
  it("Should be unable to add token twice", async () => {
    await reDeploy();
    await chef.add(1, testToken1.address, 1, 1);
    await expect(chef.add(2, testToken1.address, 1, 1)).to.be.revertedWith(
      "add: token is already present"
    );
  });
  it("Should be unable to deposit into nonexistant pool", async () => {
    await testToken1.approve(chef.address, 100000);
    await lfgToken.approve(chef.address, 100000);
    await chef.deposit(0, 100);
    await expect(chef.deposit(1, 100)).to.be.revertedWith(
      "deposit: pool does not exist"
    );
  });
  it("Should be unable to set nonexistant pool", async () => {
    await chef.set(0, 100, 100, 100);
    await expect(chef.set(1, 100, 100, 100)).to.be.revertedWith(
      "set: pool does not exist"
    );
  });
  it("Should be unable to call pendingLFG nonexistant pool", async () => {
    await chef.pendingLFG(0, owner.address);
    await expect(chef.pendingLFG(1, owner.address)).to.be.revertedWith(
      "pendingLFG: pool does not exist"
    );
  });
  it("Should be unable to call updatePool a nonexistant pool", async () => {
    await chef.updatePool(0);
    await expect(chef.updatePool(1)).to.be.revertedWith(
      "updatePool: pool does not exist"
    );
  });
});
