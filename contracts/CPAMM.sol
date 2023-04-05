// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Imports ERC20
import "./IERC20.sol";

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
        balanceOf[_from] -= _amount; // mint shares and increase balance of user
        totalSupply -= _amount; // increment the total supply
    }

    // Perform a swap between tokens in pool
    function swap() external {}

    // Add liquidity to pool - user adds liquidity of both tokens and earn fees
    function addLiquidity() external {}

    // Remove liquidity from pool - user removes liquidity of both tokens including earned fees
    function removeLiquidity() external {}



}