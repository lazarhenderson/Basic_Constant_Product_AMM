const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CPAMM Test", function () {
  it("CPAMM Functions Test", async function () {
    const accounts = await ethers.getSigners(1);
    const signer = accounts[0];

    const Token0 = await ethers.getContractFactory("Token0");
    const token0 = await Token0.deploy();
    await token0.deployed();

    const Token1 = await ethers.getContractFactory("Token1");
    const token1 = await Token1.deploy();
    await token1.deployed();

    const CPAMM = await ethers.getContractFactory("CPAMM");
    const cpamm = await CPAMM.deploy(token0.address, token1.address);
    await cpamm.deployed();

    const amount = 1000;
    await token0.mint(signer.address, amount);
    await token1.mint(signer.address, amount);
    expect(await token0.balanceOf(signer.address)).to.equal(amount);
    expect(await token1.balanceOf(signer.address)).to.equal(amount);

    // Approve the CPAMM to transferFrom signer.address
    // Approve the CPAMM to transferFrom signer.address
    // Mint token0 & token1 to CPAMM

    console.log("tokenContractOwner: ", await token0.owner());
    console.log("token totalSupply: ", await token0.totalSupply());

    // Here I need to check balanceOf token0 & token1 in CPAMM
    // expect(await token0.balanceOf(cpamm.address)).to.equal(amount);
    // expect(await token1.balanceOf(cpamm.address)).to.equal(amount);
  });
});
