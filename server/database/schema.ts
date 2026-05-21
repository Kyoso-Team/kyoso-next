import type { PgTimestampConfig } from "drizzle-orm/pg-core";
import { snakeCase, timestamp } from "drizzle-orm/pg-core";

const timestampConfig: PgTimestampConfig = {
  mode: "date",
  withTimezone: true,
};

const timestampColumns = () => {
  return {
    createdAt: timestamp(timestampConfig).notNull().defaultNow(),
    updatedAt: timestamp(timestampConfig).notNull().defaultNow(),
  };
};

export const users = snakeCase.table("user", (t) => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  isAdmin: t.boolean().notNull().default(false),
  osuId: t.integer().notNull().unique(),
  username: t.varchar().notNull(),
  countryCode: t
    .char({ length: 2 })
    .notNull()
    .references(() => countries.code, { onUpdate: "cascade" }),
  ...timestampColumns(),
}));

export const sessions = snakeCase.table("session", (table) => ({
  id: table.text().primaryKey(),
  userId: table
    .integer()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  secretHash: table.text().notNull(),
  lastVerifiedAt: table.timestamp(timestampConfig).notNull().defaultNow(),
  createdAt: timestampColumns().createdAt,
}));

export const countries = snakeCase.table("country", (t) => ({
  code: t
    .char({
      length: 2,
    })
    .primaryKey(),
  name: t.varchar().notNull(),
}));

export const discordUsers = snakeCase.table("discord_user", (t) => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  discordId: t.bigint({ mode: "string" }).notNull().unique(),
  username: t.text().notNull(),
  userId: t
    .integer()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ...timestampColumns(),
}));

export type UserSelect = typeof users.$inferSelect;
export type SessionSelect = typeof sessions.$inferSelect;
export type DiscordUserSelect = typeof discordUsers.$inferSelect;
