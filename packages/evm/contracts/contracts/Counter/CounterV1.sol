// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { CounterLib } from './CounterLib.sol';

contract CounterV1 {
  event Increment(uint256 newValue);

  function x() public view returns (uint) {
    return CounterLib.getStorage().value;
  }

  function inc() public {
    CounterLib.getStorage().value++;
    emit Increment(CounterLib.getStorage().value);
  }
}
