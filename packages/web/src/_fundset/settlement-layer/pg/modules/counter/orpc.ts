import { os } from '@orpc/server';
import { z } from 'zod';
import { countersTable, globalCounterTable } from '../../db-schema';
import { eq, sql } from 'drizzle-orm';
import { authenticatedMiddleware, dbProvider } from '../../orpc/common';

export const getGlobalCounter = os
  .use(dbProvider)
  .handler(async ({ context }) => {
    const counter = await context.db.select().from(globalCounterTable).limit(1);
    return counter[0]?.value ?? 0;
  })
  .callable();

export const getPersonalCounter = os
  .use(dbProvider)
  .input(z.object({ userId: z.string().optional() }))
  .handler(async ({ input, context }) => {
    if (!input.userId) {
      return 0;
    }

    const counter = await context.db
      .select()
      .from(countersTable)
      .where(eq(countersTable.userId, input.userId));
    return counter[0]?.value ?? 0;
  })
  .callable();

export const incrementGlobalCounter = os
  .use(dbProvider)
  .input(z.number())
  .handler(async ({ input, context }) => {
    const counter = await context.db.select().from(globalCounterTable);
    if (counter.length === 0) {
      const counter = await context.db
        .insert(globalCounterTable)
        .values({ value: input })
        .returning();
      return counter[0].value;
    }

    const newCounter = await context.db
      .update(globalCounterTable)
      .set({ value: counter[0].value + input })
      .returning();
    return newCounter[0].value;
  });

export const incrementPersonalCounter = os
  .$context<{ headers: Headers }>()
  .use(authenticatedMiddleware)
  .use(dbProvider)
  .input(z.number())
  .handler(async ({ input, context }) => {
    const counter = await context.db
      .insert(countersTable)
      .values({ value: input, userId: context.session.user.id })
      .onConflictDoUpdate({
        target: [countersTable.userId],
        set: { value: sql`${countersTable.value} + ${input}` },
      })
      .returning();
    return counter[0].value;
  });

export const counterModule = {
  globalCounter: { get: getGlobalCounter, increment: incrementGlobalCounter },
  personalCounter: { get: getPersonalCounter, increment: incrementPersonalCounter },
};
