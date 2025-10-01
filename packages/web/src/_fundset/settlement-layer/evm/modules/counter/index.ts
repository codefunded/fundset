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
import { waitForTransactionToBeIndexed } from '../../helpers';
import { graphql } from 'gql.tada';
import { request } from 'graphql-request';
import { evmSettlementLayerEnv } from '../../env';

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
    counter: {
      globalCounterValueQueryOptions: () => ({
        ...readContractQueryOptions(config, {
          address: evmModule.proxyAddress as `0x${string}`,
          abi: CounterAbiV1,
          functionName: 'x',
          chainId: chain.id,
        }),
        select: data => Number(data),
      }),
      globalCounterIncrementEventsQueryOptions: ({ limit, offset }) => ({
        queryKey: [
          'global-counter-increment-events',
          evmModule.proxyAddress,
          chain.id,
          limit,
          offset,
        ],
        queryFn: async () => {
          const globalCounterIncrementEventsQuery = graphql(`
            query GlobalCounterIncrementEvents($limit: Int!, $offset: Int!) {
              Counter_IncrementBy(limit: $limit, offset: $offset) {
                amount
                by
                id
                timestamp
              }
            }
          `);
          const globalCounterIncrementEvents = await request(
            evmSettlementLayerEnv().NEXT_PUBLIC_INDEXER_URL,
            globalCounterIncrementEventsQuery,
            { limit, offset },
          );
          return globalCounterIncrementEvents.Counter_IncrementBy.map(event => ({
            ...event,
            timestamp: new Date(Number(event.timestamp)),
          }));
        },
      }),
      isIncrementGlobalCounterReady: !!walletClient,
      incrementGlobalCounterMutationOptions: () => ({
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

              await waitForTransactionToBeIndexed(hash);
            }
          : undefined,
        meta: {
          invalidatesQueries: [
            readContractQueryKey({
              address: evmModule.proxyAddress as `0x${string}`,
              functionName: 'x',
              chainId: chain.id,
            }),
            ['global-counter-increment-events', evmModule.proxyAddress, chain.id],
          ],
        },
      }),

      personalCounterValueQueryOptions: () => ({
        ...readContractQueryOptions(config, {
          address: evmModule.proxyAddress as `0x${string}`,
          abi: CounterAbiV2,
          functionName: 'xByAddress',
          chainId: chain.id,
          args: [walletClient?.account?.address as `0x${string}`],
        }),
        select: data => Number(data),
      }),
      isIncrementPersonalCounterReady: !!walletClient,
      incrementPersonalCounterMutationOptions: () => ({
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
          invalidatesQueries: [
            readContractQueryKey({
              address: evmModule.proxyAddress as `0x${string}`,
              functionName: 'xByAddress',
              chainId: chain.id,
            }),
          ],
        },
      }),
    },
  } satisfies CounterModule;
};
