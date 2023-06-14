// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is IERC20, ERC20Burnable, Ownable {
    constructor() ERC20("Ape Coin", "Ape") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
