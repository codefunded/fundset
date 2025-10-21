import { integer, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const countersTable = pgTable('counters', {
  userId: varchar({ length: 255 }).notNull().primaryKey(),
  value: integer().notNull(),
});

export const globalCounterTable = pgTable('global_counter', {
  id: serial('id').primaryKey(),
  by: integer().notNull(),
  currentGlobalValue: integer().notNull(),
  createdAt: timestamp().defaultNow(),
});
