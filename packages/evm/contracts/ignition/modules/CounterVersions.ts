import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import DiamondProxyModule from './DiamondProxy.ts';
import { AbiFunction, toFunctionSelector, zeroAddress } from 'viem';
import { CounterV1 } from '../../abi/Counter/CounterV1.sol/index.ts';
import { CounterV2 } from '../../abi/Counter/CounterV2.sol/index.ts';
import { DIAMOND_ACTIONS } from '../../types/diamond-action.ts';

export const CounterVersionsModule = buildModule('CounterVersionsModule', m => {
  const { diamondProxy } = m.useModule(DiamondProxyModule);
  const counterV1 = m.contract('CounterV1');
  const counterV2 = m.contract('CounterV2', [], {
    after: [counterV1],
  });

  const selectorsV1 = CounterV1.filter(abi => abi.type === 'function').map(abi =>
    toFunctionSelector(abi as AbiFunction),
  );

  const selectorsV2 = CounterV2.filter(abi => abi.type === 'function').map(abi =>
    toFunctionSelector(abi as AbiFunction),
  );

  const firstAttach = m.call(
    diamondProxy,
    'diamondCut',
    [
      [{ action: DIAMOND_ACTIONS.ADD, target: counterV1, selectors: selectorsV1 }],
      zeroAddress,
      '0x',
    ],
    {
      id: 'attach_counter_v1',
    },
  );

  m.call(
    diamondProxy,
    'diamondCut',
    [
      [{ action: DIAMOND_ACTIONS.ADD, target: counterV2, selectors: selectorsV2 }],
      zeroAddress,
      '0x',
    ],
    {
      id: 'attach_counter_v2',
      after: [firstAttach],
    },
  );

  return { counterV1, counterV2 };
});

export default CounterVersionsModule;
