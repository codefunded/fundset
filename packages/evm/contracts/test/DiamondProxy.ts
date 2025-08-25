import { describe, it } from 'node:test';
import { network } from 'hardhat';
// We don't have Ethereum specific assertions in Hardhat 3 yet
import assert from 'node:assert/strict';
import DiamondProxyModule from '../ignition/modules/DiamondProxy.ts';
import { toFunctionSelector, WriteContractErrorType, zeroAddress } from 'viem';
import CounterVersionsModule from '../ignition/modules/CounterVersions.ts';
import { DIAMOND_ACTIONS } from '../types/diamond-action.ts';

describe('DiamondProxy', async function () {
  const { viem, ignition } = await network.connect();

  it('should allow to increment the counter with V1 and V2 after attaching them to the diamond proxy', async function () {
    const { diamondProxy } = await ignition.deploy(DiamondProxyModule);
    const { counterV1, counterV2 } = await ignition.deploy(CounterVersionsModule);

    const selectorsV1 = counterV1.abi
      .filter(abi => abi.type === 'function')
      .map(abi => toFunctionSelector(abi));
    const selectorsV2 = counterV2.abi
      .filter(abi => abi.type === 'function')
      .map(abi => toFunctionSelector(abi));

    // attach Counter V1
    await diamondProxy.write.diamondCut([
      [{ action: DIAMOND_ACTIONS.ADD, target: counterV1.address, selectors: selectorsV1 }],
      zeroAddress,
      '0x',
    ]);

    const diamondWithCounterV1 = await viem.getContractAt('CounterV1', diamondProxy.address);
    assert.equal(await diamondWithCounterV1.read.x(), 0n);
    await diamondWithCounterV1.write.inc();
    assert.equal(await diamondWithCounterV1.read.x(), 1n);

    // Try running V2 before attaching, should fail
    const diamondWithCounterV2 = await viem.getContractAt('CounterV2', diamondProxy.address);
    await assert.rejects(diamondWithCounterV2.write.incBy([10n]), (err: WriteContractErrorType) =>
      err.message.includes('Proxy__ImplementationIsNotContract()'),
    );

    // attach Counter V2
    await diamondProxy.write.diamondCut([
      [{ action: DIAMOND_ACTIONS.ADD, target: counterV2.address, selectors: selectorsV2 }],
      zeroAddress,
      '0x',
    ]);

    // should work now
    await diamondWithCounterV2.write.incBy([10n]);
    assert.equal(await diamondWithCounterV1.read.x(), 11n);
  });

  it('should allow to increment the counter per address', async function () {
    const { diamondProxy } = await ignition.deploy(DiamondProxyModule);
    const { counterV2 } = await ignition.deploy(CounterVersionsModule);
    const [walletClient] = await viem.getWalletClients();

    const selectorsV2 = counterV2.abi
      .filter(abi => abi.type === 'function')
      .map(abi => toFunctionSelector(abi));

    await diamondProxy.write.diamondCut([
      [{ action: DIAMOND_ACTIONS.ADD, target: counterV2.address, selectors: selectorsV2 }],
      zeroAddress,
      '0x',
    ]);

    const diamondWithCounterV2 = await viem.getContractAt('CounterV2', diamondProxy.address);
    await diamondWithCounterV2.write.incByAddress([10n]);
    assert.equal(await diamondWithCounterV2.read.xByAddress([walletClient.account.address]), 10n);
    assert.equal(await diamondWithCounterV2.read.xByAddress([zeroAddress]), 0n);
  });
});
