import { EvmSettlementLayerConfig } from './config.type';
import * as viem from 'viem';
import * as chains from 'wagmi/chains';
import { createConfig } from 'wagmi';
import { walletConnect } from 'wagmi/connectors';
import { evmSettlementLayerEnv } from './env';
import { EvmChainModules, EvmModule } from './config.type';

import { buildCounterModule } from '../modules/counter/evm/build';

export const buildEvmSettlementLayer = (
  config: EvmSettlementLayerConfig,
  {
    walletClient,
    selectedChainId,
  }: {
    walletClient?: viem.WalletClient<viem.Transport, viem.Chain, viem.Account>;
    selectedChainId?: number;
  } = {},
) => {
  const chainConfigs = config.chainConfigs.map(chain =>
    Object.values(chains).find(c => c.id === chain.chainId),
  );

  if (chainConfigs.length === 0) {
    throw new Error(`Chains [${config.chainConfigs.map(c => c.chainId).join(', ')}] not found`);
  }

  const transports = config.chainConfigs.reduce(
    (acc, chain) => ({
      ...acc,
      [chain.chainId]: viem.http(chain.rpcUrl, {
        retryCount: 5,
        retryDelay: 200,
        batch: { wait: 100 },
      }),
    }),
    {} as Record<number, viem.HttpTransport<undefined, false>>,
  );

  const wagmiConfig = createConfig({
    chains: chainConfigs as unknown as readonly [viem.Chain, ...viem.Chain[]],
    transports,
    ssr: true,
    multiInjectedProviderDiscovery: true,
    connectors:
      typeof window !== 'undefined'
        ? [
            walletConnect({
              projectId: evmSettlementLayerEnv().NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
            }),
          ]
        : [],
  });

  const evmModules = config.chainConfigs.reduce((acc, chainConfig) => {
    acc[chainConfig.chainId] = {
      proxyAddress: chainConfig.proxyAddress,
      contracts: chainConfig.modules.reduce(
        (contractsAcc, module) => {
          if ('contracts' in module) {
            module.contracts.forEach(contract => {
              Object.entries(contract).forEach(([key, value]) => {
                if (key === 'id' || value === null) {
                  return;
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (contractsAcc as any)[key] = value as `0x${string}`;
              });
            });
          }
          return contractsAcc;
        },
        {} as EvmModule['contracts'],
      ),
    };
    return acc;
  }, {} as EvmChainModules);

  const chainId = selectedChainId ?? config.chainConfigs[0].chainId;

  const chain = Object.values(chains).find(c => c.id === chainId) as chains.Chain;

  const evmModule = evmModules[chainId];
  if (!evmModule) {
    throw new Error(`Evm module not found for chainId: ${chainId}`);
  }

  const evmSettlementLayer = {
    name: 'evm',
    ...buildCounterModule({
      evmModule,
      chain,
      walletClient,
      config: wagmiConfig,
    }),
  };

  return {
    evmSettlementLayer,
    evmModules,
    chainId,
    chain,
    wagmiConfig,
    transports,
  };
};

export default buildEvmSettlementLayer;
