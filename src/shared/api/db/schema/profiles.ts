import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});
// Single source of truth for types
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
