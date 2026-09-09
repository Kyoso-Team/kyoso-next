import { isNotNull, isNull, lt, or } from "drizzle-orm";
import type { PgTimestampConfig } from "drizzle-orm/pg-core";
import {
  check,
  foreignKey,
  index,
  pgEnum,
  primaryKey,
  snakeCase,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { BWSSettings } from "~~/server/utils/validation/tournament";
import type { TournamentLink } from "~~/shared/validation/tournament-links";

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
    updatedAt: timestamp(timestampConfig)
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  };
};

export const TournamentType = pgEnum("tournament_type", ["teams", "solo"]);
export const TournamentDateType = pgEnum("tournament_date_type", [
  "stage",
  "screening",
  "showmatch",
  "holiday",
  "other",
]);

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

export const badges = snakeCase.table(
  "badge",
  (t) => ({
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    /** Example: In URL `https://assets.ppy.sh/profile-badges/owc2023-winner.png`, `owc2023-winner.png` is the file name */
    imgFileName: t.varchar().notNull(),
    description: t.text(),
    tournamentUrl: t.text(),
    isBwsEligible: t.boolean().notNull(),
  }),
  (table) => [uniqueIndex().on(table.imgFileName)],
);

export const userAwardedBadges = snakeCase.table(
  "user_badge",
  (t) => ({
    userId: t
      .integer()
      .notNull()
      .references(() => users.id),
    badgeId: t
      .integer()
      .notNull()
      .references(() => badges.id),
    awardedAt: timestamp("awarded_at", timestampConfig).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.userId, t.badgeId] }), index().on(t.userId)],
);

export const userRanks = snakeCase.table("user_rank", (t) => ({
  userId: t
    .integer()
    .primaryKey()
    .notNull()
    .references(() => users.id),
  osuRank: t.integer(),
  taikoRank: t.integer(),
  maniaRank: t.integer(),
  fruitsRank: t.integer(),
  lastUpdatedAt: t.timestamp(timestampConfig).notNull().defaultNow(),
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
    acronym: t.varchar({
      length: 8,
    }),
    type: TournamentType(),
    /** Written as Markdown */
    rules: t.text(),
    logo: t.jsonb().$type<AssetMetadata>(),
    banner: t.jsonb().$type<AssetMetadata>(),
    minTeamSize: t.integer(),
    maxTeamSize: t.integer(),
    // need explicit field since we can't infer if tournament is open rank from initially empty team sizes
    isOpenRank: t.boolean().default(false),
    lowerRankLimit: t.integer(),
    upperRankLimit: t.integer(),
    /** If null, then the tournament doesn't use BWS */
    bwsSettings: t.jsonb().$type<BWSSettings | null>().default({
      x: 0.9937,
      y: 2,
      z: 1,
      type: "linear",
      year: null,
    }),
    playerRegistrationStart: t.timestamp(timestampConfig),
    playerRegistrationEnd: t.timestamp(timestampConfig),
    staffRegistrationStart: t.timestamp(timestampConfig),
    staffRegistrationEnd: t.timestamp(timestampConfig),
    links: t.jsonb().$type<TournamentLink[]>().notNull().default([]),
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
    check("check_tournament_rank_gt", lt(t.upperRankLimit, t.lowerRankLimit)),
    check(
      "check_tournament_rank_limits",
      // @ts-expect-error
      or(isNull(t.upperRankLimit), isNotNull(t.lowerRankLimit)),
    ),
  ],
);

export const tournamentParticipants = snakeCase.table(
  "tournament_participant",
  (t) => ({
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    tournamentId: t
      .integer()
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    userId: t
      .integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    osuId: t.integer().notNull(),
    username: t.varchar().notNull(),
    countryCode: t
      .char({ length: 2 })
      .notNull()
      .references(() => countries.code),
    tournamentTeamId: t.integer().references(() => tournamentTeams.id, { onDelete: "cascade" }),
    osuRank: t.integer(),
    eligibleBadgesAmount: t.integer(),
    ...timestampColumns(),
  }),
  (t) => [
    uniqueIndex("udx_tournament_participants_tournament_id_osu_id").on(t.tournamentId, t.osuId),
    uniqueIndex("udx_tournament_participants_tournament_id_user_id").on(t.tournamentId, t.userId),
    foreignKey({
      columns: [t.tournamentId, t.tournamentTeamId],
      foreignColumns: [tournamentTeams.id, tournamentTeams.tournamentId],
    }),
  ],
);

export const tournamentTeams = snakeCase.table(
  "tournament_team",
  (t) => ({
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    name: t.varchar().notNull(),
    tournamentId: t
      .integer()
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    avatar: t.jsonb().$type<AssetMetadata>(),
    captainUserId: t
      .integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  }),
  (t) => [
    uniqueIndex("udx_teams_tournament_id_team_name").on(t.tournamentId, t.name),
    uniqueIndex("udx_tournament_team_id_tournament_id").on(t.id, t.tournamentId),
  ],
);

export const tournamentAccess = snakeCase.table("tournament_access", (t) => ({
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
}));

export const tournamentDates = snakeCase.table(
  "tournament_date",
  (t) => ({
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    tournamentId: t
      .integer()
      .notNull()
      .references(() => tournaments.id, { onDelete: "cascade" }),
    label: t.varchar().notNull(),
    type: TournamentDateType().notNull(),
    startDate: t.timestamp(timestampConfig).notNull(),
    endDate: t.timestamp(timestampConfig).notNull(),
    ...timestampColumns(),
  }),
  (t) => [
    uniqueIndex("udx_tournament_id_tournament_date_label").on(t.label, t.tournamentId),
    index("idx_tournament_start_date").on(t.tournamentId, t.startDate),
  ],
);

export type UserSelect = typeof users.$inferSelect;
export type SessionSelect = typeof sessions.$inferSelect;
export type DiscordUserSelect = typeof discordUsers.$inferSelect;

export type TournamentSelect = typeof tournaments.$inferSelect;
export type TournamentInsert = typeof tournaments.$inferInsert;

export type BadgeSelect = typeof badges.$inferSelect;
