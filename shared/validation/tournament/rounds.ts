import { createInsertSchema, createSelectSchema } from "drizzle-orm/valibot";
import * as v from "valibot";
import { tournamentRounds } from "~~/server/database/schema";

export const QUALIFIER_SEEDING_METHODS = [
  "avg_score",
  "sum_of_placements",
  "percent_max",
  "percent_diff",
  "z_sum",
  "z_percentile",
  "zipfs_law",
] as const;
export type QualifierSeedingMethod = (typeof QUALIFIER_SEEDING_METHODS)[number];

export const TIEBREAKER_OPTIONS = ["match_wins", "pd", "overall_pd", "qualifier_seed"] as const;
export type TiebreakerOption = (typeof TIEBREAKER_OPTIONS)[number];

const standardBracketConfig = v.object({
  bestOf: v.number(),
  banCount: v.number(),
  protectCount: v.optional(v.number()),
});

export const tournamentRoundConfigSchema = v.variant("type", [
  v.object({
    type: v.literal("bracket"),
    ...standardBracketConfig.entries,
  }),
  v.object({
    type: v.literal("groups"),
    // Sorted by priority (highest first)
    tiebreakerPriority: v.array(v.picklist(TIEBREAKER_OPTIONS)),
    ...standardBracketConfig.entries,
  }),
  v.object({
    type: v.literal("qualifiers"),
    runCount: v.number(),
    /**
     * Only matters if there are multiple runs.
     * `average`: Calculate the average score for each map in all runs.
     * `sum`: Calculate the sum of scores for each map in all runs.
     * `best`: Get the best score for each map
     */
    summarizeRunsAs: v.picklist(["average", "sum", "best"]),
    seedingMethod: v.picklist(QUALIFIER_SEEDING_METHODS),
  }),
]);
export type TournamentRoundConfig = v.InferOutput<typeof tournamentRoundConfigSchema>;

export const tournamentRoundSchema = createSelectSchema(tournamentRounds, {
  config: tournamentRoundConfigSchema,
});
export type TournamentRound = v.InferOutput<typeof tournamentRoundSchema>;

export const tournamentRoundCreateSchema = createInsertSchema(tournamentRounds, {
  config: tournamentRoundConfigSchema,
});

export const tournamentRoundUpdateSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, "Name is required")),
  config: tournamentRoundConfigSchema,
});

export type TournamentRoundUpdate = v.InferOutput<typeof tournamentRoundUpdateSchema>;

export type TournamentRoundRow = {
  id: number;
  tournamentId: number;
  name: string;
  config: TournamentRoundConfig;
  createdAt: Date;
  updatedAt: Date;
};
