// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

library CounterLib {
  bytes32 public constant CounterStorageLocation =
    keccak256(abi.encode(uint256(keccak256('fundset.counter.storage')) - 1)) ^
      bytes32(uint256(0xff));

  struct CounterStorage {
    uint value;
    mapping(address => uint) valueByAddress;
  }

  function getStorage() internal pure returns (CounterStorage storage s) {
    bytes32 position = CounterStorageLocation;
    assembly {
      s.slot := position
    }
  }
}
