'use client';

import { useChainId, useConfig, useWalletClient } from 'wagmi';
import { SettlementLayer } from 'fundset/settlement-layer';
import { useMemo } from 'react';
import { buildCounterModule } from './modules/counter';
import { EvmChainModules, EvmModule } from './config.type';
import * as chains from 'wagmi/chains';
import { useEvmChainConfigs } from '.';

export const useEvmSettlementLayer = () => {
  const evmChainConfigs = useEvmChainConfigs();
  const { data: walletClient } = useWalletClient();
  const config = useConfig();
  const chainId = useChainId();

  const evmModules = useMemo(() => {
    return evmChainConfigs.reduce((acc, chainConfig) => {
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
  }, [evmChainConfigs]);

  const evmSettlementLayer: SettlementLayer = useMemo(() => {
    const chain = Object.values(chains).find(c => c.id === chainId) as chains.Chain;

    const evmModule = evmModules[chainId];
    if (!evmModule) {
      throw new Error(`Evm module not found for chainId: ${chainId}`);
    }

    return {
      name: 'evm',
      ...buildCounterModule({
        evmModule,
        chain,
        walletClient,
        config,
      }),
    };
  }, [walletClient, evmModules, chainId, config]);

  return evmSettlementLayer;
};

export default useEvmSettlementLayer;
