// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';
import { ERC20 as ERC20Base } from '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract ERC20 is Ownable, ERC20Base {
  constructor(
    string memory name,
    string memory symbol
  ) Ownable(msg.sender) ERC20Base(name, symbol) {}
}
