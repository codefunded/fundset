import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const pgSettlementLayerEnv = () =>
  createEnv({
    server: {
      GOOGLE_CLIENT_ID: z.string().optional(),
      GOOGLE_CLIENT_SECRET: z.string().optional(),
    },
    client: {},
    experimental__runtimeEnv: {},
    emptyStringAsUndefined: true,
  });
