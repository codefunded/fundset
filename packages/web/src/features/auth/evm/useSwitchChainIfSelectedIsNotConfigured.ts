'use client';

import { useConfig, useConnections, useSwitchChain } from 'wagmi';
import { useEffect } from 'react';

export const useSwitchChainIfSelectedIsNotConfigured = () => {
  const { switchChain } = useSwitchChain();
  const config = useConfig();
  const connections = useConnections();

  useEffect(() => {
    if (connections.length === 0) return;
    const connection = connections.at(0);
    const configuredChains = config.chains.map(chain => chain.id);

    if (connection?.chainId && !configuredChains.includes(connection.chainId)) {
      switchChain({ chainId: configuredChains[0] });
    }
  }, [switchChain, connections, config]);
};
