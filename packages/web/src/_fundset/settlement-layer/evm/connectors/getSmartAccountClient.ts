import { type Chain, createPublicClient, EIP1193Provider, http, Transport } from 'viem';
import { createSmartAccountClient } from 'permissionless';
import { entryPoint07Address } from 'viem/account-abstraction';
import { createPimlicoClient } from 'permissionless/clients/pimlico';
import { toKernelSmartAccount } from 'permissionless/accounts';

export const getSmartAccountClient = async ({
  chainId,
  chains,
  transports,
  provider,
  accountAbstractionChainConfigs,
}: {
  chainId: number;
  chains: Chain[];
  transports?: Record<number, Transport>;
  provider: EIP1193Provider;
  accountAbstractionChainConfigs?: {
    chainId: number;
    bundlerUrl: string;
    paymasterUrl: string;
  }[];
}) => {
  const selectedChain = chains.find(chain => chain.id === chainId);
  if (!selectedChain) {
    throw new Error(`Chain ${chainId} not found`);
  }
  const publicClient = createPublicClient({
    chain: selectedChain,
    transport: http(transports?.[chainId]?.({}).value?.url),
  });

  const smartAccount = await toKernelSmartAccount({
    owners: [provider as EIP1193Provider],
    client: publicClient,
    entryPoint: {
      address: entryPoint07Address,
      version: '0.7',
    },
    index: 0n,
  });

  const accountAbstractionChainConfig = accountAbstractionChainConfigs?.find(
    x => x.chainId === chainId,
  );

  if (!accountAbstractionChainConfig) {
    throw new Error(`Account abstraction module not found for chain ${chainId}`);
  }

  const paymasterClient = createPimlicoClient({
    transport: http(accountAbstractionChainConfig.paymasterUrl),
    entryPoint: {
      address: entryPoint07Address,
      version: '0.7',
    },
  });

  const smartAccountClient = createSmartAccountClient({
    bundlerTransport: http(accountAbstractionChainConfig.bundlerUrl),
    chain: selectedChain,
    account: smartAccount,
    paymaster: paymasterClient,
    userOperation: {
      estimateFeesPerGas: async () => (await paymasterClient.getUserOperationGasPrice()).fast,
    },
  });
  return smartAccountClient;
};
