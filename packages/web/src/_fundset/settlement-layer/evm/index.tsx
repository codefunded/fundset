'use client';

import { useEffect, useMemo } from 'react';
import type { EvmSettlementLayerConfig } from './config.type';

import { createContext, useContext } from 'react';
import { SimpleKitProvider } from '@/features/auth/evm/components/simplekit';

import { buildEvmSettlementLayer } from './buildSettlementLayer';
import { WagmiProvider } from './connectors/WagmiProviderWithAA';
import { Web3AuthProvider } from '@web3auth/modal/react';
import { Web3AuthOptions } from '@web3auth/modal';
import { evmSettlementLayerEnv } from './env';
import { ensureDefined } from '@/lib/ensureDefined';

const evmEnv = evmSettlementLayerEnv();
const web3AuthOptions = {
  clientId: evmEnv.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || '',
  web3AuthNetwork: evmEnv.NEXT_PUBLIC_WEB3AUTH_NETWORK,
} satisfies Web3AuthOptions;

const Web3AuthProviderWrapper = ({ children }: React.PropsWithChildren) => {
  if (!evmEnv.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID) {
    return children;
  }
  return <Web3AuthProvider config={{ web3AuthOptions }}>{children}</Web3AuthProvider>;
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
  const { wagmiConfig } = useMemo(() => buildEvmSettlementLayer(props.config), [props.config]);

  const accountAbstractionChainConfigs = useMemo(
    () =>
      ensureDefined(
        props.config.chainConfigs
          .map(chainConfig => {
            const aaModule = chainConfig.modules.find(
              module => module.blockType === 'evm-aa-module',
            );
            if (!aaModule) {
              return null;
            }
            return {
              chainId: chainConfig.chainId,
              bundlerUrl: aaModule.bundlerUrl,
              paymasterUrl: aaModule.paymasterUrl,
            };
          })
          .filter(Boolean),
      ),
    [props.config.chainConfigs],
  );

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
    <EvmChainConfigsProvider config={props.config.chainConfigs}>
      <Web3AuthProviderWrapper>
        <WagmiProvider
          config={wagmiConfig}
          accountAbstractionChainConfigs={accountAbstractionChainConfigs}
        >
          <SimpleKitProvider>{children}</SimpleKitProvider>
        </WagmiProvider>
      </Web3AuthProviderWrapper>
    </EvmChainConfigsProvider>
  );
};

export default EvmSettlementLayerProvider;
