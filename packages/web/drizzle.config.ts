import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { env } from '@/env';

export default defineConfig({
  out: './src/_fundset/settlement-layer/pg/drizzle',
  schema: [
    './src/_fundset/settlement-layer/pg/db-schema.ts',
    './src/_fundset/settlement-layer/pg/auth-schema.ts',
  ],
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URI,
  },
  verbose: true,
});
