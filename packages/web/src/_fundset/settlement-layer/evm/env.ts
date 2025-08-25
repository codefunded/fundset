import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const evmSettlementLayerEnv = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: z.string().optional(),
    },
    experimental__runtimeEnv: {
      NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
    },
    emptyStringAsUndefined: true,
  });
