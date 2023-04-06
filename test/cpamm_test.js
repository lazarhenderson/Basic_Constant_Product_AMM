const { expect } = require("chai");
const { ethers } = require("hardhat");
const { token0_abi, token1_abi } = require("../ABI/ABI_List.js");

describe("CPAMM Test", async function () {
  it("Deploy Token0, Token1 & CPAMM Contracts", async function () {
    [this.liquidityProvider, this.trader] = await ethers.getSigners();

    const Token0 = await ethers.getContractFactory("Token0");
    const token0 = await Token0.deploy();
    this.token0 = await token0.deployed();

    const Token1 = await ethers.getContractFactory("Token1");
    const token1 = await Token1.deploy();
    this.token1 = await token1.deployed();

    const CPAMM = await ethers.getContractFactory("CPAMM");
    const cpamm = await CPAMM.deploy(token0.address, token1.address);
    this.cpamm = await cpamm.deployed();
  });

  it("Ensure Token0 & Token1 Sent To Wallet", async function () {
    this.amount1 = 1000;
    this.amount2 = 500;
    await this.token0.mint(this.liquidityProvider.address, this.amount1);
    await this.token1.mint(this.liquidityProvider.address, this.amount2);

    expect(
      await this.token0.balanceOf(this.liquidityProvider.address)
    ).to.equal(this.amount1);
    expect(
      await this.token1.balanceOf(this.liquidityProvider.address)
    ).to.equal(this.amount2);
  });

  it("Approve CPAMM to transfer tokens0/1 from liquidityProvider.address", async function () {
    const token0_contract = new ethers.Contract(
      this.token0.address, // token address
      token0_abi, // token ABI
      this.liquidityProvider
    );
    const token1_contract = new ethers.Contract(
      this.token1.address, // token address
      token1_abi, // token ABI
      this.liquidityProvider
    );

    token0_approve = await token0_contract.approve(
      this.cpamm.address,
      this.amount1,
      {
        from: this.liquidityProvider.address,
      }
    );
    token1_approve = await token1_contract.approve(
      this.cpamm.address,
      this.amount2,
      {
        from: this.liquidityProvider.address,
      }
    );
  });

  it("Add liquidity to CPAMM", async function () {
    await this.cpamm.addLiquidity(this.amount1, this.amount2, {
      from: this.liquidityProvider.address,
    });
    // Check shares in user's wallet
    console.log(
      "       User's shares balance in CPAMM: ",
      await this.cpamm.balanceOf(this.liquidityProvider.address)
    );
  });

  it("Test reserves balance in CPAMM", async function () {
    expect(await this.token0.balanceOf(this.cpamm.address)).to.equal(
      this.amount1
    );
    expect(await this.token1.balanceOf(this.cpamm.address)).to.equal(
      this.amount2
    );
    console.log("       CPAMM reserve0: ", await this.cpamm.reserve0());
    console.log("       CPAMM reserve1: ", await this.cpamm.reserve1());
  });
});
