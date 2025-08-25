import { ORPCError, os } from '@orpc/server';
import { auth } from '@/lib/auth';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { env } from '@/env';

export const dbProvider = os
  .$context<{ db?: NodePgDatabase<Record<string, never>> }>()
  .middleware(async ({ next, context }) => {
    const db = context.db ?? drizzle(env.DATABASE_URI);
    return next({ context: { db } });
  });

export const authenticatedMiddleware = os
  .$context<{ headers: Headers }>()
  .middleware(async ({ next, context }) => {
    const session = await auth.api.getSession({
      headers: context.headers,
    });

    if (session) {
      return next({ context: { session } });
    }

    throw new ORPCError('UNAUTHORIZED');
  });
