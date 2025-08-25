'use client';

import { useEvmChainConfigs } from '@/_fundset/settlement-layer/evm';
import {
  getWeb3AuthConnector,
  LOGIN_PROVIDER_TYPE,
  SESSION_TIME,
} from '@/_fundset/settlement-layer/evm';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useLayoutEffect } from 'react';
import { useAccountEffect, useChainId, useConfig, useConnect } from 'wagmi';

const useConnections = () => {
  const CURRENT_VERSION = 1;
  const [connections, setConnections] = useLocalStorage('fundset.connections', {
    state: { chainId: 0, current: null, connections: { value: [] } },
    version: CURRENT_VERSION,
  } as {
    version: number;
    state: {
      chainId: number;
      current: string | null;
      connections: {
        value: [
          string,
          {
            accounts: string[];
            chainId: number;
            connector: {
              id: string;
              name: string;
              type: string;
              uid: string;
            };
            sessionFinishAt: number;
          },
        ][];
      };
    };
  });

  useEffect(
    function migrateConnectionsToLatestVersionIfNeeded() {
      if (connections.version !== CURRENT_VERSION) {
        setConnections({
          version: CURRENT_VERSION,
          state: { chainId: 0, current: null, connections: { value: [] } },
        });
      }
    },
    [connections.version, setConnections],
  );

  useEffect(
    function clearConnectionsIfSessionIsExpired() {
      if (!connections.state.current) {
        return;
      }
      const connection = connections.state.connections.value.find(
        ([uid]) => uid === connections.state.current,
      );
      if (!connection) {
        return;
      }
      if (connection[1].sessionFinishAt < Date.now()) {
        setConnections(prev => ({
          ...prev,
          state: { ...prev.state, current: null, connections: { value: [] } },
        }));
      }
    },
    [connections.state, setConnections],
  );

  useAccountEffect({
    onConnect: account => {
      setConnections(prev => ({
        ...prev,
        state: {
          ...prev.state,
          current: account.connector.uid,
          connections: {
            value: [
              [
                account.connector.uid,
                {
                  accounts: [account.address],
                  chainId: account.chainId,
                  connector: {
                    id: account.connector.id,
                    name: account.connector.name,
                    type: account.connector.type,
                    uid: account.connector.uid,
                  },
                  sessionFinishAt: Date.now() + SESSION_TIME,
                },
              ],
            ],
          },
        },
      }));
    },
    onDisconnect: () => {
      setConnections(prev => ({
        ...prev,
        state: {
          ...prev.state,
          current: null,
          connections: {
            value: [],
          },
        },
      }));
    },
  });

  return connections;
};

export const useReconnectWeb3Auth = () => {
  const connections = useConnections();
  const { connect } = useConnect();
  const config = useConfig();
  const chainId = useChainId();
  const chainConfigs = useEvmChainConfigs();

  useLayoutEffect(
    function reconnectWeb3AuthIfIsLoggedIn() {
      if (!connections.state.current) return;
      const connector = connections.state.connections.value.at(0)?.[1];
      if (!connector || connector.connector.type !== 'Web3Auth') return;
      if (connector.sessionFinishAt < Date.now()) return;

      const lastProvider = connector.connector.id.split('-')[1] as LOGIN_PROVIDER_TYPE;

      connect({
        connector: getWeb3AuthConnector({
          wagmiConfig: config,
          chainConfigs,
          selectedChainId: chainId,
          provider: lastProvider,
        }),
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
};
