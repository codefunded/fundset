import type { Config } from 'wagmi';

import type { LOGIN_PROVIDER_TYPE } from '@web3auth/auth-adapter';
import { createWeb3AuthNoModalConnector } from '../base';
import type { EvmSettlementLayerConfig } from '../../../config.type';

export const getWeb3AuthConnector = ({
  wagmiConfig,
  chainConfigs,
  selectedChainId,
  provider,
}: {
  wagmiConfig: Config;
  chainConfigs: EvmSettlementLayerConfig['chainConfigs'];
  selectedChainId: number;
  provider: LOGIN_PROVIDER_TYPE;
}) => {
  const selectedChain = wagmiConfig.chains.find(chain => chain.id === selectedChainId);
  if (!selectedChain) {
    throw new Error(`Chain ${selectedChainId} not found`);
  }

  const accountAbstractionConfigs = chainConfigs
    .map(chainConfig => ({
      chainId: chainConfig.chainId,
      aaModule: chainConfig.modules.find(module => module.blockType === 'evm-aa-module'),
    }))
    .filter(aaConfig => aaConfig.aaModule)
    .map(aaConfig => ({
      chainId: aaConfig.chainId,
      paymasterUrl: aaConfig.aaModule!.paymasterUrl,
      entryPointAddress: aaConfig.aaModule!.entryPointAddress,
      bundlerUrl: aaConfig.aaModule!.bundlerUrl,
      providers: aaConfig.aaModule!.providers,
      blockType: 'evm-aa-module' as const,
    }));

  const chainConfig = chainConfigs.find(chainConfig => chainConfig.chainId === selectedChainId);

  const accountAbstractionChainConfig = chainConfig?.modules.find(
    module => module.blockType === 'evm-aa-module',
  );
  if (!accountAbstractionChainConfig) {
    throw new Error(`Account abstraction module not found for chain ${selectedChainId}`);
  }

  const providerConfig = accountAbstractionChainConfig.providers.find(p => p.provider === provider);
  if (!providerConfig) {
    throw new Error(`Provider ${provider} not found`);
  }

  return createWeb3AuthNoModalConnector({
    chainId: selectedChainId,
    rpcUrl:
      wagmiConfig._internal.transports?.[selectedChainId]?.({}).value?.url ||
      selectedChain.rpcUrls.default.http[0],
    displayName: selectedChain.name,
    loginParams: { loginProvider: provider, mfaLevel: providerConfig.mfaLevel },
    accountAbstractionConfigs,
  });
};
