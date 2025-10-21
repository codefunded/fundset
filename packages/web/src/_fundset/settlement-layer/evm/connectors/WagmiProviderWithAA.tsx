'use client';

import { log } from '@web3auth/modal';
import { useWeb3Auth, useWeb3AuthDisconnect, useWeb3AuthUser } from '@web3auth/modal/react';
import { createElement, Fragment, PropsWithChildren, useEffect } from 'react';
import { type Chain, EIP1193Provider, Transport } from 'viem';
import {
  Config,
  Connection,
  Connector,
  CreateConnectorFn,
  useAccountEffect,
  useConfig as useWagmiConfig,
  useReconnect,
  WagmiProvider as WagmiProviderBase,
  createConnector,
  useChainId,
} from 'wagmi';
import type { WagmiProviderProps } from 'wagmi';
import { evmSettlementLayerEnv } from '../env';

// Account Abstraction
import { type SmartAccountClient } from 'permissionless';
import { getSmartAccountClient } from './getSmartAccountClient';

const WEB3AUTH_CONNECTOR_ID = 'web3auth';

export const authConnectionToIcon = {
  google: 'https://unpkg.com/simple-icons@15.16.1/icons/google.svg',
  twitter: 'https://unpkg.com/simple-icons@15.16.1/icons/x.svg',
  facebook: 'https://unpkg.com/simple-icons@15.16.1/icons/facebook.svg',
  reddit: 'https://unpkg.com/simple-icons@15.16.1/icons/reddit.svg',
  discord: 'https://unpkg.com/simple-icons@15.16.1/icons/discord.svg',
  twitch: 'https://unpkg.com/simple-icons@15.16.1/icons/twitch.svg',
  apple: 'https://unpkg.com/simple-icons@15.16.1/icons/apple.svg',
  github: 'https://unpkg.com/simple-icons@15.16.1/icons/github.svg',
};

// Helper to initialize connectors for the given wallets
async function setupConnector(
  provider: EIP1193Provider,
  config: Config,
  {
    chains,
    currentChainId,
    transports,
    accountAbstractionChainConfigs,
    authConnection,
  }: {
    chains: Chain[];
    currentChainId: number;
    transports?: Record<number, Transport> | undefined;
    accountAbstractionChainConfigs?: {
      chainId: number;
      bundlerUrl: string;
      paymasterUrl: string;
    }[];
    authConnection?: string;
  },
) {
  let connector: Connector | CreateConnectorFn | undefined = config.connectors.find(
    c => c.id === WEB3AUTH_CONNECTOR_ID,
  );

  if (connector) return connector;

  // DIRECT W3A EOA INJECTED CONNECTOR (NO SMART ACCOUNT)
  // connector = injected({
  //   target: {
  //     provider: provider,
  //     id: WEB3AUTH_CONNECTOR_ID,
  //     name: "Web3Auth",
  //   },
  // });

  let smartAccountClient = await getSmartAccountClient({
    chainId: currentChainId,
    chains,
    transports,
    provider,
    accountAbstractionChainConfigs,
  });

  connector = createConnector<SmartAccountClient>(config => ({
    id: WEB3AUTH_CONNECTOR_ID,
    name: (authConnection?.at(0)?.toUpperCase() || '') + (authConnection?.slice(1) || ''),
    ready: true,
    icon: authConnectionToIcon[authConnection as keyof typeof authConnectionToIcon],
    getAccounts: async () => [smartAccountClient.account.address],
    getChainId: async () => smartAccountClient.chain.id,
    connect: async ({ withCapabilities } = {}) =>
      ({
        accounts: withCapabilities
          ? [{ address: smartAccountClient.account.address, capabilities: {} }]
          : [smartAccountClient.account.address],
        chainId: smartAccountClient.chain.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any,
    disconnect: async () => {},
    getProvider: async () => smartAccountClient,
    isAuthorized: async () => true,
    onAccountsChanged: async () => {},
    getClient: async () => smartAccountClient,
    switchChain: async ({ chainId }) => {
      smartAccountClient = await getSmartAccountClient({
        chainId,
        chains,
        transports,
        provider,
        accountAbstractionChainConfigs,
      });
      config.emitter.emit('change', {
        chainId,
      });
      return smartAccountClient.chain;
    },
    onChainChanged() {},
    onDisconnect(): void {
      config.emitter.emit('disconnect');
    },
    type: 'smartAccount',
  }));

  const result = config._internal.connectors.setup(connector);
  config._internal.connectors.setState(current => [...current, result]);
  return result;
}

// Helper to connect a wallet and update wagmi state
async function connectWeb3AuthWithWagmi(connector: Connector, config: Config) {
  await Promise.all([
    config.storage?.removeItem(`${connector.id}.disconnected`),
    config.storage?.setItem('recentConnectorId', connector.id),
  ]);

  let chainId = await connector.getChainId();
  if (!config.chains.find(c => c.id === chainId)) {
    chainId = config.chains[0].id;
  }

  const accounts = await connector.getAccounts();

  const connections: Map<string, Connection> = new Map([
    [
      connector.uid,
      {
        accounts: [accounts[0]],
        chainId,
        connector,
      },
    ],
  ]);

  config.setState(state => ({
    ...state,
    chainId,
    connections,
    current: connector.uid,
    status: 'connected',
  }));
}

async function disconnectWeb3AuthFromWagmi(config: Config) {
  config._internal.connectors.setState(prev => prev.filter(c => c.id !== WEB3AUTH_CONNECTOR_ID));
  config.setState(state => ({
    ...state,
    chainId: state.chainId,
    connections: new Map(),
    current: null,
    status: 'disconnected',
  }));
}

function Web3AuthWagmiProvider({
  children,
  accountAbstractionChainConfigs,
}: PropsWithChildren<AccountAbstractionChainConfigProps>) {
  const { isConnected, provider } = useWeb3Auth();
  const { disconnect } = useWeb3AuthDisconnect();
  const wagmiConfig = useWagmiConfig();
  const { reconnect } = useReconnect();
  const selectedChainId = useChainId();
  const { getUserInfo } = useWeb3AuthUser();

  useAccountEffect({
    onDisconnect: async () => {
      log.info('Disconnected from wagmi');
      if (isConnected) await disconnect();
    },
  });

  useEffect(() => {
    (async () => {
      if (isConnected && provider) {
        const selectedChain = wagmiConfig.chains.find(chain => chain.id === selectedChainId);
        if (!selectedChain) {
          log.error('Selected chain not found');
          throw new Error('Selected chain not found');
        }
        const userInfo = await getUserInfo();
        const connector = await setupConnector(provider as EIP1193Provider, wagmiConfig, {
          authConnection: userInfo?.authConnection,
          currentChainId: wagmiConfig.state.chainId,
          chains: wagmiConfig.chains as unknown as Chain[],
          accountAbstractionChainConfigs,
        });
        if (!connector) {
          log.error('Failed to setup react wagmi connector');
          throw new Error('Failed to setup connector');
        }

        await connectWeb3AuthWithWagmi(connector as Connector, wagmiConfig);
        reconnect();
      } else if (!isConnected) {
        if (wagmiConfig.state.status === 'connected') {
          await disconnectWeb3AuthFromWagmi(wagmiConfig);
        }
      }
    })();
  }, [
    isConnected,
    wagmiConfig,
    provider,
    reconnect,
    selectedChainId,
    getUserInfo,
    accountAbstractionChainConfigs,
  ]);

  return createElement(Fragment, null, children);
}

interface AccountAbstractionChainConfigProps {
  accountAbstractionChainConfigs?: {
    chainId: number;
    bundlerUrl: string;
    paymasterUrl: string;
  }[];
}

const evmEnv = evmSettlementLayerEnv();

export function WagmiProvider({
  children,
  ...props
}: PropsWithChildren<WagmiProviderProps & AccountAbstractionChainConfigProps>) {
  if (!evmEnv.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID) {
    return createElement(
      WagmiProviderBase,
      { ...props, config: props.config, reconnectOnMount: true },
      children,
    );
  }
  return createElement(
    WagmiProviderBase,
    // typecast to WagmiProviderPropsBase to avoid type error
    // as we are omitting the config prop from WagmiProviderProps
    // and creating a new config object with the finalConfig
    { ...props, config: props.config, reconnectOnMount: true },
    createElement(
      Web3AuthWagmiProvider,
      { accountAbstractionChainConfigs: props.accountAbstractionChainConfigs },
      children,
    ),
  );
}
