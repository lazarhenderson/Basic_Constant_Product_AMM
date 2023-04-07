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

  it("Send Token0 & Token1 To LiquidityProvider & Trader Wallet", async function () {
    // Send to liquidityProvider
    this.amount1 = 1000;
    this.amount2 = 500;
    await this.token0.mint(this.liquidityProvider.address, this.amount1);
    await this.token1.mint(this.liquidityProvider.address, this.amount2);

    // Send to trader
    this.amount3 = 1000;
    this.amount4 = 1000;
    await this.token0.mint(this.trader.address, this.amount3);
    await this.token1.mint(this.trader.address, this.amount4);

    // Test liquidityProvider balances
    expect(
      await this.token0.balanceOf(this.liquidityProvider.address)
    ).to.equal(this.amount1);
    expect(
      await this.token1.balanceOf(this.liquidityProvider.address)
    ).to.equal(this.amount2);

    // Test trader balances
    expect(await this.token0.balanceOf(this.trader.address)).to.equal(
      this.amount3
    );
    expect(await this.token1.balanceOf(this.trader.address)).to.equal(
      this.amount4
    );
  });

  it("Approve CPAMM to transfer token0/1 from liquidityProvider", async function () {
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

  it("Add liquidity to CPAMM from liquidityProvider", async function () {
    await this.cpamm.addLiquidity(this.amount1, this.amount2, {
      from: this.liquidityProvider.address,
    });

    this.liquidityProvider_shares_bigNumber = await this.cpamm.balanceOf(
      this.liquidityProvider.address
    );

    // // Check shares in user's wallet
    // console.log(
    //   "       User's shares balance in CPAMM: ",
    //   this.liquidityProvider_shares_bigNumber.toNumber()
    // );
  });

  it("Test reserves balance in CPAMM", async function () {
    expect(await this.token0.balanceOf(this.cpamm.address)).to.equal(
      this.amount1
    );
    expect(await this.token1.balanceOf(this.cpamm.address)).to.equal(
      this.amount2
    );
    reserve0_bigNumber = await this.cpamm.reserve0();
    reserve1_bigNumber = await this.cpamm.reserve1();
    // console.log("       CPAMM reserve0: ", reserve0_bigNumber.toNumber());
    // console.log("       CPAMM reserve1: ", reserve1_bigNumber.toNumber());
  });

  it("Have trader swap token0 for token1", async function () {
    // Approve token0 in CPAMM
    const token0_contract = new ethers.Contract(
      this.token0.address, // token address
      token0_abi, // token ABI
      this.trader // signer
    );
    token0_approve_trader = await token0_contract.approve(
      this.cpamm.address,
      100,
      {
        from: this.trader.address,
      }
    );

    // Call CPAMM to perform swap
    await this.cpamm.connect(this.trader).swap(this.token0.address, 100);
  });

  it("Expect trader's token1 balance to increase", async function () {
    trader_token1_bigNumber = await this.token1.balanceOf(this.trader.address);
    expect(trader_token1_bigNumber.toNumber()).to.be.greaterThan(this.amount4);
    // console.log(
    //   "       Trader's token1 balance increased by: ",
    //   trader_token1_bigNumber.toNumber() - this.amount4
    // );
  });

  it("Test if liquidityProvider token0 & token1 made gains from swap fees", async function () {
    // Remove liquidity from pool
    await this.cpamm.removeLiquidity(
      this.liquidityProvider_shares_bigNumber.toNumber(),
      {
        from: this.liquidityProvider.address,
      }
    );

    // Get token0 & token1 balances of liquidityProvider
    liquidityProvider_token0_balance = await this.token0.balanceOf(
      this.liquidityProvider.address
    );
    liquidityProvider_token1_balance = await this.token1.balanceOf(
      this.liquidityProvider.address
    );

    // Expect new combination balance of token0 & token1 to be greater than before
    expect(
      liquidityProvider_token0_balance.toNumber() +
        liquidityProvider_token1_balance.toNumber()
    ).to.be.greaterThan(this.amount1 + this.amount2);
  });
});
