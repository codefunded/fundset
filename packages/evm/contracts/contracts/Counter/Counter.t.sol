// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { DiamondProxy } from '../DiamondProxy.sol';
import { IERC2535DiamondCutInternal } from '@solidstate/contracts/interfaces/IERC2535DiamondCut.sol';
import { CounterV1 } from './CounterV1.sol';
import { CounterV2 } from './CounterV2.sol';
import { Test } from 'forge-std/Test.sol';

// Solidity tests are compatible with foundry, so they
// use the same syntax and offer the same functionality.

contract CounterV2Test is Test {
  DiamondProxy diamondProxy;
  CounterV1 counterV1;
  CounterV2 counterV2;

  function setUp() public {
    diamondProxy = new DiamondProxy();

    counterV1 = new CounterV1();
    counterV2 = new CounterV2();

    IERC2535DiamondCutInternal.FacetCut[]
      memory facetCuts = new IERC2535DiamondCutInternal.FacetCut[](2);

    bytes4[] memory selectorsV1 = new bytes4[](2);
    selectorsV1[0] = bytes4(keccak256('inc()'));
    selectorsV1[1] = bytes4(keccak256('x()'));

    bytes4[] memory selectorsV2 = new bytes4[](1);
    selectorsV2[0] = bytes4(keccak256('incBy(uint256)'));

    facetCuts[0] = IERC2535DiamondCutInternal.FacetCut({
      action: IERC2535DiamondCutInternal.FacetCutAction.ADD,
      target: address(counterV1),
      selectors: selectorsV1
    });
    facetCuts[1] = IERC2535DiamondCutInternal.FacetCut({
      action: IERC2535DiamondCutInternal.FacetCutAction.ADD,
      target: address(counterV2),
      selectors: selectorsV2
    });

    diamondProxy.diamondCut(facetCuts, address(0), bytes(''));
  }

  function test_InitialValue() public view {
    CounterV1 counter = CounterV1(address(diamondProxy));
    require(counter.x() == 0, 'Initial value should be 0');
  }

  function testFuzz_Inc(uint8 x) public {
    CounterV1 counter = CounterV1(address(diamondProxy));
    for (uint8 i = 0; i < x; i++) {
      counter.inc();
    }
    require(counter.x() == x, 'Value after calling inc x times should be x');
  }

  function test_IncByZero() public {
    CounterV2 counter = CounterV2(address(diamondProxy));
    vm.expectRevert(CounterV2.CounterV2__ZeroIncrement.selector);
    counter.incBy(0);
  }
}
