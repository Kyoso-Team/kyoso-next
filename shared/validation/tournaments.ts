import { createSelectSchema, createUpdateSchema } from "drizzle-orm/valibot";
import * as v from "valibot";
import { tournaments } from "~~/server/database/schema";
import { bwsSettingsSchema } from "~~/server/utils/validation/tournament";

import { tournamentDatesSchema } from "./tournament-dates";

export const createTournamentSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2, "Tournament name must be at least 2 characters long.")),
  slug: v.pipe(v.string(), v.minLength(2, "Tournament slug must be at least 2 characters long.")),
  acronym: v.pipe(
    v.string(),
    v.minLength(2, "Tournament acronym must be at least 2 characters long."),
  ),
});

const updateSchema = createUpdateSchema(tournaments, {
  name: (schema) => v.pipe(schema, v.minLength(2, "Name must be at least 2 characters long.")),
  slug: (schema) => v.pipe(schema, v.minLength(2, "Slug must be at least 2 characters long.")),
  acronym: (schema) =>
    v.pipe(schema, v.minLength(2, "Acronym must be at least 2 characters long.")),
  bwsSettings: v.optional(bwsSettingsSchema),
  lowerRankLimit: v.nullish(v.number("Lower rank limit is required")),
  upperRankLimit: v.nullish(v.number("Upper rank limit is required")),
});

const {
  bwsSettings: _bwsSettings,
  banner: _banner,
  logo: _logo,
  ...updateEntries
} = updateSchema.entries;

export const updateTournamentSchema = v.pipe(
  v.object({
    ...updateEntries,
    bwsSettings: v.pipe(
      v.nullish(bwsSettingsSchema),
      v.check(
        (input) => input?.type !== "linear" || input.z === 1,
        "Invalid BWS formula parameters",
      ),
    ),
  }),
  v.rawCheck(({ dataset, addIssue }) => {
    if (!dataset.typed) return;

    const { maxTeamSize, minTeamSize, type } = dataset.value;
    const hasMaxTeamSize = maxTeamSize != null;
    const hasMinTeamSize = minTeamSize != null;
    const hasBothTeamSizes = hasMaxTeamSize && hasMinTeamSize;
    const isTeamTournament = type === "teams";

    const addIssueFor = (key: "maxTeamSize" | "minTeamSize", message: string) => {
      addIssue({
        message,
        path: [
          {
            key,
            type: "object",
            origin: "value",
            input: dataset.value,
            value: dataset.value[key],
          },
        ],
      });
    };

    if (hasBothTeamSizes && !isTeamTournament) {
      addIssueFor("maxTeamSize", "Solo tournaments cannot have a team size");
      addIssueFor("minTeamSize", "Solo tournaments cannot have a team size");
    }

    if (isTeamTournament && !hasBothTeamSizes) {
      if (!hasMaxTeamSize) addIssueFor("maxTeamSize", "Team size required");
      if (!hasMinTeamSize) addIssueFor("minTeamSize", "Team size required");
    }

    if (hasBothTeamSizes && (maxTeamSize <= 1 || minTeamSize <= 1)) {
      if (maxTeamSize <= 1) addIssueFor("maxTeamSize", "Max team size must be greater than 1");
      if (minTeamSize <= 1) addIssueFor("minTeamSize", "Min team size must be greater than 1");
    }
  }),
  v.forward(
    v.check((input) => {
      if (!input.isOpenRank) {
        return input.lowerRankLimit !== null;
      }
      return true;
    }, "Lower rank limit required"),
    ["lowerRankLimit"],
  ),
  v.forward(
    v.partialCheck(
      [["lowerRankLimit"], ["upperRankLimit"]],
      (input) => {
        if (!!input.lowerRankLimit && !!input.upperRankLimit) {
          return input.upperRankLimit <= input.lowerRankLimit;
        }
        return true;
      },
      "Lower rank limit must be greater than upper rank limit",
    ),
    ["lowerRankLimit"],
  ),
);

export type UpdateTournament = v.InferOutput<typeof updateTournamentSchema>;

export const selectTournamentSchema = createSelectSchema(tournaments, {
  bwsSettings: v.nullable(bwsSettingsSchema),
  banner: v.nullable(v.pipe(v.string(), v.url())),
  logo: v.nullable(v.pipe(v.string(), v.url())),
});

export const tournamentSchema = v.object({
  ...v.omit(selectTournamentSchema, [
    "playerRegistrationStart",
    "playerRegistrationEnd",
    "staffRegistrationStart",
    "staffRegistrationEnd",
  ]).entries,
  tournamentDates: tournamentDatesSchema,
});

export type Tournament = v.InferOutput<typeof tournamentSchema>;
