import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const evmSettlementLayerEnv = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: z.string().optional(),
      NEXT_PUBLIC_INDEXER_URL: z.string().default('http://localhost:8080/v1/graphql'),
    },
    experimental__runtimeEnv: {
      NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
      NEXT_PUBLIC_INDEXER_URL: process.env.NEXT_PUBLIC_INDEXER_URL,
    },
    emptyStringAsUndefined: true,
  });
