# Basic Constant Product AMM Liquidity Pool

Here I've built a basic Constant Product AMM Liquidity Pool that is able to host 2 tokens that are set in a constructor. Users are able to:

- Add liquidity of the 2 tokens into the pool and receive swap fees generated by traders
- Perform token swaps between token0 and token1, paying a 0.3% fee
- Remove their added liquidity including earned fees generated by traders

The reserves of token0 & token1 are controlled internally by the addLiquidity, removeLiquidity & swap functions to prevent users from sending token0/token1 directly into pool and manipulating balances. If token0/token1 balances are manipulated it can mess up the calculations for user's swaps and shares from adding or removing liquidity.

[See Contract File](contracts/CPAMM.sol)

<!-- TABLE OF CONTENTS -->

  <summary># Table of Contents</summary>
  <ol>
    <li><a href="#what-can-be-added-to-contract">What can be added to contract</a></li>
    <li><a href="#adding-liquidity-to-pool">Adding liquidity to pool</a></li>
    <li><a href="#removing-liquidity-from-pool">Removing liquidity from pool</a></li>
    <li><a href="#to-test-the-cp-amm-contract">Test the CP AMM Contract</a></li>
  </ol>

## What can be added to contract

- Contract owner
- A minimum liquidity
- Cumulative prices of token0 & token1
- Re-entrancy modifiers
- Gas efficient reserves call like UniswapV2 LP's
- Events for Approval, Transfer, Liquidity Add, Liquidity Removal, Swap, Reserves Update

## Adding liquidity to pool

```shell
function addLiquidity(uint _amount0, uint _amount1) external returns(uint shares)
```

In order to add liquidity to the pool, users will first approve the LP to spend the amount of token0 and token1 that the user has specified. If approval is complete, the pool first checks whether the amounts of token0 & token1 being added by the user does not affect the prices of the tokens in the pool. If the prices of the tokens are affect then the pool will throw an error. Once both steps are passed, the user's shares are then calculated using the constant product AMM shares formula which is:

```shell
### If liquidity in pool is equal to 0
- Shares to mint = sqrt of (amount0_added * amount1_added)
```

#### or

```shell
### If liquidity in pool is greater than 0
#   x = amount0_added | y = amount1_added | dx = reserve0 | dy = reserve1 | T = total supply in pool
- Shares to mint based on token0 = dx / x * T
- Shares to mint based on token1 = dy / y * T
```

If shares are greater than 0, then the LP mints the shares to the user and reserve0 and reserve1 are updated at the end of the function.

#### What can be added to function:

- Mint fee
- Event of minting

## Removing liquidity from pool

```shell
function removeLiquidity(uint _shares) external returns(uint amount0, uint amount1)
```

First the LP checks the balance of token0 and token1 inside the pool. The amount of liquidity to be withdrawn is then calculated based on the shares that the user has passed in. The calculations of user's shares for token0 and token1 is done using the following formula:

```shell
### Token0 shares calculation
#   dx = token0 amount out | s = shares | x = balance of token0 in LP | T = total supply in pool
- dx = (s * x) / T

### Token1 shares calculation
#   dy = token1 amount out | s = shares | y = balance of token1 in LP | T = total supply in pool
- dy = (s * y) / T
```

A require statement is then put in place to ensure that liquidity being removed is greater than 0. Shares are then burned/removed from the user and total supply in LP. Reserves of token0 and token1 are updated and the liquidity share of token0 & token1 including trading fees are sent to the user.

## Test the CP AMM Contract

To test this, you can download or clone this repository and do the following:

```shell
# Install Hardhat:
npm i -D hardhat

# Run this and click enter 4 times:
npx hardhat

# Install dependencies:
npm install --save-dev @nomicfoundation/hardhat-chai-matchers
npm i -D @nomiclabs/hardhat-waffle

# Run the test file using:
npx hardhat test test/cpamm_test.js
```
