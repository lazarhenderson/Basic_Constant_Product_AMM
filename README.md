# Basic Constant Product AMM Liquidity Pool

Here I've built a basic Constant Product AMM liquidity pool that is able to host 2 tokens that are set in a constructor. Liquidity providers are able to add liquidity of the 2 tokens into the pool and receive swap fees generated by traders. Liquidity providers are also able to remove their liquidity including earned fees. The reserves of token0 & token1 are controlled internally by the mint, burn & swap funtions to prevent users from sending token0/token1 directly into pool and manipulating balances. If token0/token1 balances are manipulated it can mess up the swap's amountOut sent to user and the amount of shares to mint/burn.

## Adding liquidity to pool

In order to add liquidity to the pool, users will first approve the LP to spend the amount of token0 and token1 that the user has specified. If approval is complete, the pool first checks whether the amounts of token0 & token1 being added by the user does not affect the prices of the tokens in the pool. If the amounts do change the prices of the tokens then the pool will throw an error. Once both steps are passed the user's shares are then calculated using the constant product AMM shares formula which is:

```shell
### If liquidity in pool is equal to 0
- Shares to mint = sqrt of (amount0 added \* amount1 added)
```

### or

```shell
### If liquidity in pool is greater than 0
- Shares to mint based on token0 = dx / x * T
- Shares to mint based on token1 = dy / y * T
```
