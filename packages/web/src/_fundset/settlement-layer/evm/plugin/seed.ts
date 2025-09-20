import { BasePayload } from 'payload';
import { entryPoint07Address } from 'viem/account-abstraction';
import type { deploy } from '@fundset/contracts/deploy';
import type { FundsetSettlementLayer } from '@/payload-types';

const waitForContracts = async () => {
  while (true) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('@fundset/contracts/localhost_deployed_contracts.json') as Awaited<
        ReturnType<typeof deploy>
      >;
    } catch {
      console.log('Waiting for contracts to be deployed...', 'localhost_deployed_contracts.json');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

export const seed = async (
  payload: BasePayload,
  deployedContracts?: Awaited<ReturnType<typeof deploy>>,
  replaceExisting = false,
) => {
  const localhostDeployments = deployedContracts ?? (await waitForContracts());

  const fundsetSettlementLayer = await payload.findGlobal({
    slug: 'fundset-settlement-layer',
  });

  const settlementLayerConfigs = fundsetSettlementLayer.settlementLayer ?? [];

  const evmConfig: FundsetSettlementLayer['settlementLayer'] = [
    {
      type: 'evm',
      blockType: 'evm-settlement-layer',
      chainConfigs: [
        {
          chainId: 31337,
          rpcUrl: 'http://localhost:8545',
          proxyAddress: localhostDeployments.DiamondProxy.contract,
          modules: [
            {
              blockType: 'evm-aa-module',
              bundlerUrl: '/api/bundler',
              paymasterUrl: 'http://localhost:4338',
              entryPointAddress: entryPoint07Address,
              providers: [
                {
                  provider: 'google',
                  mfaLevel: 'default',
                },
                {
                  provider: 'twitter',
                  mfaLevel: 'default',
                },
              ],
            },
            {
              blockType: 'evm-token-module',
              contracts: [{ token: localhostDeployments.ERC20.contract }],
            },
          ],
        },
      ],
    },
  ];

  let newConfigs;
  if (replaceExisting) {
    // Remove all existing evm configs, then add ours
    const filtered = settlementLayerConfigs.filter(c => c.type !== 'evm');
    newConfigs = [...filtered, ...evmConfig];
  } else {
    // Only add if not present
    const hasEvm = settlementLayerConfigs.some(c => c?.type === 'evm');
    newConfigs = hasEvm ? settlementLayerConfigs : [...settlementLayerConfigs, ...evmConfig];
  }

  await payload.updateGlobal({
    slug: 'fundset-settlement-layer',
    data: {
      settlementLayer: newConfigs.toReversed(),
    },
  });
};
