'use client';

import { useEffect, useMemo } from 'react';
import * as viem from 'viem';
import * as chains from 'wagmi/chains';
import { type Chain } from 'wagmi/chains';
import { createConfig } from 'wagmi';
import type { EvmSettlementLayerConfig } from './config.type';
import { Web3AuthProvider } from '@web3auth/modal/react';
import { WagmiProvider } from './connectors/WagmiProviderWithAA';
import { walletConnect } from 'wagmi/connectors';

import { createContext, useContext } from 'react';
import { SimpleKitProvider } from '@/features/auth/evm/components/simplekit';

import { type Web3AuthContextConfig } from '@web3auth/modal/react';
import { type Web3AuthOptions } from '@web3auth/modal';
import { evmSettlementLayerEnv } from './env';

const evmEnv = evmSettlementLayerEnv();
const web3AuthOptions: Web3AuthOptions = {
  clientId: evmEnv.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || '',
  web3AuthNetwork: evmEnv.NEXT_PUBLIC_WEB3AUTH_NETWORK,
};

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions,
};

export * from './config.type';

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

    return {
      wagmiConfig: createConfig({
        chains: configChains as unknown as readonly [Chain, ...Chain[]],
        transports,
        ssr: true,
        multiInjectedProviderDiscovery: true,
        connectors: [
          walletConnect({
            projectId: evmEnv.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
          }),
        ],
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
    <Web3AuthProvider config={web3AuthContextConfig}>
      <WagmiProvider config={wagmiConfig}>
        <EvmChainConfigsProvider config={props.config.chainConfigs}>
          <SimpleKitProvider>{children}</SimpleKitProvider>
        </EvmChainConfigsProvider>
      </WagmiProvider>
    </Web3AuthProvider>
  );
};

export default EvmSettlementLayerProvider;
