// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Imports IERC20
import "../interfaces/IERC20.sol";

contract CPAMM {

    // Tokens it will inherit
    IERC20 public immutable token0;
    IERC20 public immutable token1;

    // Reserves of tokens
    uint public reserve0; // tracks how much token0 is in contract
    uint public reserve1; // tracks how much token1 is in contract

    // When a user adds or removes liquidity we will need to mint or burn shares
    uint public totalSupply; // total supply of contract
    mapping(address => uint) public balanceOf; // each user's share of the supply
    
    constructor (address _token0, address _token1) {
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }

    // This will send minted shares to user
    function _mint(address _to, uint _amount) private {
        balanceOf[_to] += _amount; // mint shares and increase balance of user
        totalSupply += _amount; // increment the total supply
    }

    // This will burn shares from a user
    function _burn(address _from, uint _amount) private {
        balanceOf[_from] -= _amount; // burn shares and decrease balance of user
        totalSupply -= _amount; // decrement the total supply
    }

    // Update the reserves of tokens after each addLiquidity, removeLiquidity & swap function call
    function _update(uint _reserve0, uint _reserve1) private {
        reserve0 = _reserve0;
        reserve1 = _reserve1;
    }

    // Add liquidity to pool - user adds liquidity of both tokens and earn fees
    function addLiquidity(uint _amount0, uint _amount1) external returns(uint shares) {

        // Ensure the liquidity added does not change the price of token0 & token1
        // Formula: dy / dx = y / x
        if (reserve0 > 0 || reserve1 > 0) {
            require(reserve0 * _amount1 == reserve1 * _amount0, "Liquidity added is not allowed to change token prices");
        }

        // Get token0 and token1 from user
        token0.transferFrom(msg.sender, address(this), _amount0);
        token1.transferFrom(msg.sender, address(this), _amount1);

        // Mint shares
        // Calculate liquidity by getting the sqrt of x * y || liquidity = sqrt(xy)
        // Shares to mint = dx / x * T = dy / y * T ... x = _amount0 | dx = reserve0 | T = total_shares | y = _amount1 | dy = reserve1
        if (totalSupply == 0) {
            shares = _sqrt(_amount0 * _amount1);
        } else {
            shares = _min( (_amount0 * totalSupply) / reserve0, (_amount1 * totalSupply) / reserve1 );
        }
        require(shares > 0, "Shares = 0");
        _mint(msg.sender, shares);

        // Update reserves
        _update(token0.balanceOf(address(this)), token1.balanceOf(address(this)));
    }

    // Remove liquidity from pool - user removes liquidity of both tokens including earned fees
    function removeLiquidity(uint _shares) external returns(uint amount0, uint amount1) {

        // Amount0 and Amount1 to withdraw
        // dx = s / T * x ... dx = token0 | s = shares | T = totalShares | x = reserve0
        // dy = s / T * y ... dy = token1 | s = shares | T = totalShares | y = reserve1
        uint bal0 = token0.balanceOf(address(this));
        uint bal1 = token1.balanceOf(address(this));
        // dx = (s * x) / T --- formula re-arranged slightly
        amount0 = (_shares * bal0) / totalSupply;
        // dy = (s * y) / T --- formula re-arranged slightly
        amount1 = (_shares * bal1) / totalSupply;
        require(amount0 > 0 && amount1 > 0, "Liquidity error, ensure _shares is correct");

        // Burn shares
        _burn(msg.sender, _shares);

        // Update reserves
        _update(bal0 - amount0, bal1 - amount1);

        // Transfer tokens to msg.sender
        token0.transfer(msg.sender, amount0);
        token1.transfer(msg.sender, amount1);
        
    }

    // Perform a swap between tokens in pool
    function swap(address _tokenIn, uint _amountIn) external returns(uint amountOut) {
        require(_tokenIn == address(token0) || _tokenIn == address(token1), "Invalid token in");
        require(_amountIn > 0, "Amount in must be greater than 0");

        // Determine if tokenIn is token0 or not
        bool isToken0 = _tokenIn == address(token0);

        // Determine tokenIn, tokenOut, reserveIn, reserveOut
        (IERC20 tokenIn, IERC20 tokenOut, uint reserveIn, uint reserveOut) = isToken0 
            ? (token0, token1, reserve0, reserve1) : (token1, token0, reserve1, reserve0);

        // Transfer tokenIn from user
        tokenIn.transferFrom(msg.sender, address(this), _amountIn);

        // Calculate tokenOut including 0.3% fee
        // Formula: y*dx / (x + dx) = dy ... dy = tokenOut reserve | x = _amountIn (incl. fee) from user | dx = tokenIn reserve
        uint amountInWithFee = (_amountIn * 997) / 1000; // 0.3%
        amountOut = (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee);

        // Transfer tokenOut to msg.sender
        tokenOut.transfer(msg.sender, amountOut);
        
        // Update the reserves:
        // Done internally to prevent users from sending token0/token1 to pool and manipulating balances
        // If token0/token1 balances are manipulated it can mess up the swaps and the amount of shares to mint/burn
        _update(token0.balanceOf(address(this)), token1.balanceOf(address(this)));
    }

    // Calculate square root
    function _sqrt(uint y) private pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    // Choose the min amount of either "dx / x * T" or "dy / y * T" shares
    function _min(uint x, uint y) private pure returns (uint) {
        // If x smaller than y then choose x, if not, choose y
        return x <= y ? x : y;
    }

}