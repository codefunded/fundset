import { Config } from 'wagmi';
import { waitForTransactionReceipt, writeContract } from 'wagmi/actions';
import {
  readContractQueryKey,
  readContractQueryOptions,
  writeContractMutationOptions,
} from 'wagmi/query';

import CounterAbiV1 from '@fundset/contracts/abi/Counter/CounterV1.sol/CounterV1';
import CounterAbiV2 from '@fundset/contracts/abi/Counter/CounterV2.sol/CounterV2';
import { EvmModule } from '../../config.type';
import { Account, Chain, Transport, WalletClient } from 'viem';
import { CounterModule } from '@/_fundset/settlement-layer/modules/counter';

export const buildCounterModule = ({
  evmModule,
  chain,
  walletClient,
  config,
}: {
  evmModule: EvmModule;
  chain: Chain;
  walletClient: WalletClient<Transport, Chain, Account> | undefined;
  config: Config;
}) => {
  return {
    globalCounterValueQueryOptions: {
      ...readContractQueryOptions(config, {
        address: evmModule.proxyAddress as `0x${string}`,
        abi: CounterAbiV1,
        functionName: 'x',
        chainId: chain.id,
      }),
      select: data => Number(data),
    },
    isIncrementGlobalCounterReady: !!walletClient,
    incrementGlobalCounterMutationOptions: {
      ...writeContractMutationOptions(config),
      mutationFn: walletClient
        ? async (amount: number) => {
            const hash = await writeContract(config, {
              chain,
              account: walletClient.account,
              abi: CounterAbiV2,
              address: evmModule.proxyAddress as `0x${string}`,
              functionName: 'incBy',
              args: [BigInt(amount)],
            });

            if (!hash) return;

            await waitForTransactionReceipt(config, {
              hash,
            });
          }
        : undefined,
      meta: {
        invalidatesQuery: readContractQueryKey({
          address: evmModule.proxyAddress as `0x${string}`,
          functionName: 'x',
          chainId: chain.id,
        }),
      },
    },

    personalCounterValueQueryOptions: {
      ...readContractQueryOptions(config, {
        address: evmModule.proxyAddress as `0x${string}`,
        abi: CounterAbiV2,
        functionName: 'xByAddress',
        chainId: chain.id,
        args: [walletClient?.account?.address as `0x${string}`],
      }),
      select: data => Number(data),
    },
    isIncrementPersonalCounterReady: !!walletClient,
    incrementPersonalCounterMutationOptions: {
      ...writeContractMutationOptions(config),
      mutationFn: walletClient
        ? async (amount: number) => {
            const hash = await writeContract(config, {
              chain,
              account: walletClient.account,
              abi: CounterAbiV2,
              address: evmModule.proxyAddress as `0x${string}`,
              functionName: 'incByAddress',
              args: [BigInt(amount)],
            });

            if (!hash) return;

            await waitForTransactionReceipt(config, {
              hash,
            });
          }
        : undefined,
      meta: {
        invalidatesQuery: readContractQueryKey({
          address: evmModule.proxyAddress as `0x${string}`,
          functionName: 'xByAddress',
          chainId: chain.id,
        }),
      },
    },
  } satisfies CounterModule;
};
