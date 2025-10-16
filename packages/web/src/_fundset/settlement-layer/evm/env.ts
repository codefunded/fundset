import { createEnv } from '@t3-oss/env-nextjs';
import { WEB3AUTH_NETWORK } from '@web3auth/modal';
import { z } from 'zod';

export const evmSettlementLayerEnv = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: z.string().optional(),
      NEXT_PUBLIC_WEB3AUTH_NETWORK: z
        .custom<(typeof WEB3AUTH_NETWORK)[keyof typeof WEB3AUTH_NETWORK]>()
        .optional()
        .default(WEB3AUTH_NETWORK.SAPPHIRE_DEVNET),
      NEXT_PUBLIC_INDEXER_URL: z.string().default('http://localhost:8080/v1/graphql'),
      NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: z.string().optional(),
    },
    experimental__runtimeEnv: {
      NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
      NEXT_PUBLIC_WEB3AUTH_NETWORK: process.env.NEXT_PUBLIC_WEB3AUTH_NETWORK,
      NEXT_PUBLIC_INDEXER_URL: process.env.NEXT_PUBLIC_INDEXER_URL,
      NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    },
    emptyStringAsUndefined: true,
  });
