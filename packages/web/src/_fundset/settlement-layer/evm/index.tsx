'use client';

import { useEffect, useMemo } from 'react';
import * as viem from 'viem';
import * as chains from 'wagmi/chains';
import { type Chain } from 'wagmi/chains';
import { createConfig, WagmiProvider } from 'wagmi';
import type { EvmSettlementLayerConfig } from './config.type';

export * from './config.type';
export * from './connectors/web3auth';

import { createContext, useContext } from 'react';
import { SimpleKitProvider } from '@/features/auth/evm/components/simplekit';
import { getWeb3AuthConnector } from './connectors/web3auth/providers';

export const EvmChainConfigsContext = createContext<
  EvmSettlementLayerConfig['chainConfigs'] | null
>(null);

export const useEvmChainConfigs = () => {
  const config = useContext(EvmChainConfigsContext);
  if (!config) {
    throw new Error('EvmChainConfigsContext not found');
  }
  return config;
};

export const EvmChainConfigsProvider = ({
  children,
  config,
}: React.PropsWithChildren<{
  config: EvmSettlementLayerConfig['chainConfigs'];
}>) => {
  return (
    <EvmChainConfigsContext.Provider value={config}>{children}</EvmChainConfigsContext.Provider>
  );
};

const EvmSettlementLayerProvider = ({
  children,
  ...props
}: React.PropsWithChildren<{ config: EvmSettlementLayerConfig }>) => {
  const { wagmiConfig } = useMemo(() => {
    const configChains = props.config.chainConfigs.map(chain =>
      Object.values(chains).find(c => c.id === chain.chainId),
    );

    if (configChains.length === 0) {
      throw new Error(
        `Chains [${props.config.chainConfigs.map(c => c.chainId).join(', ')}] not found`,
      );
    }

    const transports = props.config.chainConfigs.reduce(
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

    const socialConnectors = props.config.chainConfigs.flatMap(
      chain =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        chain.modules
          .find(module => module.blockType === 'evm-aa-module')
          ?.providers.map(({ provider }) =>
            getWeb3AuthConnector({
              chains: configChains as unknown as Chain[],
              chainConfigs: props.config.chainConfigs,
              selectedChainId: chain.chainId,
              provider,
              customRpcUrl: transports?.[chain.chainId]?.({}).value?.url,
            }),
          )
          .filter(Boolean)!,
    );

    return {
      wagmiConfig: createConfig({
        chains: configChains as unknown as readonly [Chain, ...Chain[]],
        transports,
        ssr: true,
        multiInjectedProviderDiscovery: true,
        pollingInterval: 1000,
        connectors: [...socialConnectors],
      }),
    };
  }, [props.config.chainConfigs]);

  useEffect(function hotContractReload() {
    if (process.env.NODE_ENV === 'development') {
      const wss = new WebSocket('http://localhost:9999');
      wss.onopen = () => {
        console.log('Hot Contract Reload: WebSocket connection established');
      };
      wss.onmessage = event => {
        if (event.data === 'reload') {
          window.location.reload();
        }
      };
      return () => {
        console.log('Hot Contract Reload: WebSocket connection closed');
        wss.close();
      };
    }
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <EvmChainConfigsProvider config={props.config.chainConfigs}>
        <SimpleKitProvider>{children}</SimpleKitProvider>
      </EvmChainConfigsProvider>
    </WagmiProvider>
  );
};

export default EvmSettlementLayerProvider;
