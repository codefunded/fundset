import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '@/env';
import * as authSchema from '@/_fundset/settlement-layer/pg/auth-schema';
import { pgSettlementLayerEnv } from '@/_fundset/settlement-layer/pg/plugin/env';

const db = drizzle(env.DATABASE_URI);

export const auth = betterAuth({
  appName: 'fundset',
  baseURL: env.NEXT_PUBLIC_APP_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: pgSettlementLayerEnv().GOOGLE_CLIENT_ID!,
      clientSecret: pgSettlementLayerEnv().GOOGLE_CLIENT_SECRET!,
    },
  },
});
