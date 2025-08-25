// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { CounterLib } from './CounterLib.sol';

contract CounterV2 {
  event IncrementBy(uint256 newValue, uint256 by);
  error CounterV2__ZeroIncrement();

  function incBy(uint by) public {
    if (by == 0) {
      revert CounterV2__ZeroIncrement();
    }
    CounterLib.getStorage().value += by;
    emit IncrementBy(CounterLib.getStorage().value, by);
  }

  function xByAddress(address addr) public view returns (uint) {
    return CounterLib.getStorage().valueByAddress[addr];
  }

  function incByAddress(uint by) public {
    CounterLib.getStorage().valueByAddress[msg.sender] += by;
    emit IncrementBy(CounterLib.getStorage().valueByAddress[msg.sender], by);
  }
}
