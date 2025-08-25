import { BasePayload } from 'payload';
import { entryPoint07Address } from 'viem/account-abstraction';

const waitForContracts = async () => {
  while (true) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('@fundset/contracts/localhost_deployed_contracts.json');
    } catch {
      console.log('Waiting for contracts to be deployed...', 'localhost_deployed_contracts.json');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

export const seed = async (payload: BasePayload) => {
  const localhostDeployments = await waitForContracts();

  const fundsetSettlementLayer = await payload.findGlobal({
    slug: 'fundset-settlement-layer',
  });

  const settlementLayerConfigs = fundsetSettlementLayer.settlementLayer ?? [];

  await payload.updateGlobal({
    slug: 'fundset-settlement-layer',
    depth: 0,
    data: {
      settlementLayer: settlementLayerConfigs
        .concat([
          {
            type: 'evm',
            blockType: 'evm-settlement-layer',
            chainConfigs: [
              {
                chainId: 31337,
                rpcUrl: 'http://localhost:8545',
                proxyAddress: localhostDeployments.DiamondProxy.address,
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
                    contracts: [{ dividendToken: localhostDeployments.ERC20.address }],
                  },
                ],
              },
            ],
          },
        ])
        .toReversed(),
    },
  });
};
