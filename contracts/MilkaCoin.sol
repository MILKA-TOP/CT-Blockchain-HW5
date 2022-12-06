//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;

// We import this library to be able to use console.log
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MilkaCoin is ERC20 {
    constructor() ERC20("Vote MILKA Coin", "VMT") {
        _mint(msg.sender, 100 * 1000000);
    }
}
