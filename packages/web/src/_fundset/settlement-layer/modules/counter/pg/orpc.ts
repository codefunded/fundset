import { os } from '@orpc/server';
import { z } from 'zod';
import { countersTable, globalCounterTable } from '../../../pg/db-schema';
import { desc, eq, sql } from 'drizzle-orm';
import { authenticatedMiddleware, dbProvider } from '../../../pg/orpc/common';
import { GlobalCounterIncrementEvent } from '@/_fundset/settlement-layer/modules/counter/counter';

export const getGlobalCounter = os
  .use(dbProvider)
  .handler(async ({ context }) => {
    const counter = await context.db
      .select()
      .from(globalCounterTable)
      .orderBy(desc(globalCounterTable.createdAt))
      .limit(1);
    return counter[0]?.currentGlobalValue ?? 0;
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
    const currentGlobalValue = await getGlobalCounter({ context });
    await context.db.insert(globalCounterTable).values({
      by: input,
      currentGlobalValue: currentGlobalValue + input,
    });
  });

export const incrementPersonalCounter = os
  .$context<{ headers: Headers }>()
  .use(authenticatedMiddleware)
  .use(dbProvider)
  .input(z.number())
  .handler(async ({ input, context }) => {
    await context.db
      .insert(countersTable)
      .values({ value: input, userId: context.session.user.id })
      .onConflictDoUpdate({
        target: [countersTable.userId],
        set: { value: sql`${countersTable.value} + ${input}` },
      });
  });

export const getGlobalCounterEvents = os
  .use(dbProvider)
  .input(z.object({ offset: z.number().default(0), limit: z.number().default(10) }))
  .handler(async ({ input, context }) => {
    const events = await context.db
      .select()
      .from(globalCounterTable)
      .orderBy(desc(globalCounterTable.createdAt))
      .limit(input.limit)
      .offset(input.offset);
    return events.map(
      event =>
        ({
          amount: event.currentGlobalValue,
          timestamp: event.createdAt ?? new Date(),
          by: event.by,
          id: event.id.toString(),
        }) as GlobalCounterIncrementEvent,
    );
  });

export const counterModule = {
  globalCounter: {
    get: getGlobalCounter,
    increment: incrementGlobalCounter,
    getEvents: getGlobalCounterEvents,
  },
  personalCounter: { get: getPersonalCounter, increment: incrementPersonalCounter },
};
