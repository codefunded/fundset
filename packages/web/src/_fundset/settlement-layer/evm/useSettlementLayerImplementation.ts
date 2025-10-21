'use client';

import { useChainId, useWalletClient } from 'wagmi';
import { useMemo } from 'react';
import { useEvmChainConfigs } from '.';
import { buildEvmSettlementLayer } from './buildSettlementLayer';

export const useEvmSettlementLayer = () => {
  const evmChainConfigs = useEvmChainConfigs();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  const evmSettlementLayer = useMemo(
    () =>
      buildEvmSettlementLayer(
        {
          blockType: 'evm-settlement-layer',
          chainConfigs: evmChainConfigs,
          type: 'evm',
        },
        {
          selectedChainId: chainId,
          walletClient,
        },
      ).evmSettlementLayer,
    [evmChainConfigs, chainId, walletClient],
  );

  return evmSettlementLayer;
};

export default useEvmSettlementLayer;
