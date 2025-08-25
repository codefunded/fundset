import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const countersTable = pgTable('counters', {
  userId: varchar({ length: 255 }).notNull().primaryKey(),
  value: integer().notNull(),
});

export const globalCounterTable = pgTable('global_counter', {
  value: integer().notNull().default(0),
});
