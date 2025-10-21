'use server';

import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { EvmSettlementLayerConfig } from './config.type';
import { buildEvmSettlementLayer } from './buildSettlementLayer';

export default async function EvmSettlementLayerServerSide({
  children,
  config,
}: React.PropsWithChildren<{ config: EvmSettlementLayerConfig }>) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5_000,
      },
    },
  });

  const { evmSettlementLayer } = buildEvmSettlementLayer(config);

  await queryClient.prefetchQuery(evmSettlementLayer.counter.globalCounterValueQueryOptions());

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
