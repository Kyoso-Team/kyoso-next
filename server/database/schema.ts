import { gt, isNotNull, isNull, or } from "drizzle-orm";
import type { PgTimestampConfig } from "drizzle-orm/pg-core";
import {
  check,
  index,
  pgEnum,
  primaryKey,
  snakeCase,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { BWSValues } from "~~/server/utils/validation/tournament";

export type AssetMetadata = {
  fileId: string;
  originalFileName: string;
};

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

export const TournamentType = pgEnum("tournament_type", ["teams", "solo"]);
export const StaffRoles = pgEnum("staff_roles", [
  "admin",
  "playtester",
  "replayer",
  "referee",
  "commentator",
  "mappooler",
  "streamer",
  "gfx",
]);

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

export const tournaments = snakeCase.table(
  "tournament",
  (t) => ({
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    name: t.varchar().notNull(),
    description: t.text(),
    slug: t
      .varchar({
        length: 32,
      })
      .unique()
      .notNull(),
    acronym: t
      .varchar({
        length: 8,
      })
      .notNull(),
    type: TournamentType().notNull(),
    /** Written as Markdown */
    rules: t.text(),
    logo: t.jsonb().$type<AssetMetadata>(),
    banner: t.jsonb().$type<AssetMetadata>(),
    minTeamSize: t.integer().notNull(),
    maxTeamSize: t.integer().notNull(),
    lowerRankLimit: t.integer(),
    upperRankLimit: t.integer(),
    /** If null, then the tournament doesn't use BWS */
    bwsValues: t.jsonb().$type<BWSValues>(),
    hostUserId: t
      .integer()
      .notNull()
      .references(() => users.id),
    deletedAt: t.timestamp(timestampConfig),
    ...timestampColumns(),
  }),
  (t) => [
    index("idx_tournament_deleted_at").on(t.deletedAt),
    uniqueIndex("idx_tournament_name").on(t.name).where(isNull(t.deletedAt)),
    check("check_tournament_rank_gt", gt(t.upperRankLimit, t.lowerRankLimit)),
    check(
      "check_tournament_rank_limits",
      // @ts-expect-error
      or(isNull(t.upperRankLimit), isNotNull(t.lowerRankLimit)),
    ),
  ],
);

export const tournamentAccess = snakeCase.table(
  "tournament_access",
  (t) => ({
    tournamentId: t
      .integer()
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    userId: t
      .integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roles: StaffRoles().array().notNull(),
    ...timestampColumns(),
  }),
  (t) => [primaryKey({ columns: [t.tournamentId, t.userId] })],
);

export type UserSelect = typeof users.$inferSelect;
export type SessionSelect = typeof sessions.$inferSelect;
export type DiscordUserSelect = typeof discordUsers.$inferSelect;

export type TournamentSelect = typeof tournaments.$inferSelect;
export type TournamentInsert = typeof tournaments.$inferInsert;
