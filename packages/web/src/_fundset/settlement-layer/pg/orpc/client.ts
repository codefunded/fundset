import type { RouterClient } from '@orpc/server';
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { router } from './router';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import { env } from '@/env';

const link = new RPCLink({
  url: `${env.NEXT_PUBLIC_APP_URL}/api/rpc`,
  headers: async () => {
    if (typeof window !== 'undefined') {
      return {};
    }

    const { headers } = await import('next/headers');
    return Object.fromEntries(await headers());
  },
});

export const orpc: RouterClient<typeof router> = createORPCClient(link);

export const oRPCQueryUtils = createTanstackQueryUtils(orpc);
