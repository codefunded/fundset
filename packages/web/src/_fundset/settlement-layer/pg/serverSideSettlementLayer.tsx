'use server';

import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { buildPgSettlementLayer } from './buildSettlementLayer';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function PgSettlementLayerServerSide({ children }: React.PropsWithChildren) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5_000,
      },
    },
  });

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { pgSettlementLayer } = buildPgSettlementLayer({ session });

  await Promise.all([
    queryClient.prefetchQuery(pgSettlementLayer.counter.globalCounterValueQueryOptions()),
    queryClient.prefetchQuery(pgSettlementLayer.counter.personalCounterValueQueryOptions()),
  ]);

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
