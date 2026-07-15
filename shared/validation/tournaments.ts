import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/valibot";
import * as v from "valibot";
import { tournaments } from "~~/server/database/schema";
import { bwsSettingsSchema } from "~~/server/utils/validation/tournament";

import { initialUndefinedSchema } from "./common";
import { tournamentDatesSchema } from "./tournament-dates";

const createSchema = createInsertSchema(tournaments, {
  name: (schema) => v.pipe(schema, v.minLength(2, "Input must have 2 character(s) or more.")),
  slug: (schema) => v.pipe(schema, v.minLength(2, "Input must have 2 character(s) or more.")),
  acronym: (schema) => v.pipe(schema, v.minLength(2, "Input must have 2 character(s) or more.")),
  minTeamSize: initialUndefinedSchema(v.number("Min team size is required")),
  maxTeamSize: initialUndefinedSchema(v.number("Max team size is required")),
  lowerRankLimit: v.undefinedable(v.number("Lower rank limit is required")),
  upperRankLimit: v.undefinedable(v.number("Upper rank limit is required")),
});

const { name, slug, acronym, type, minTeamSize, maxTeamSize, lowerRankLimit, upperRankLimit } =
  createSchema.entries;

export const createTournamentSchema = v.pipe(
  v.object({
    name,
    slug,
    acronym,
    type,
    minTeamSize,
    maxTeamSize,
    lowerRankLimit,
    upperRankLimit,
  }),
  v.forward(
    v.partialCheck(
      [["minTeamSize"], ["maxTeamSize"]],
      (input) => {
        return input.maxTeamSize >= input.minTeamSize;
      },
      "Max team size cannot be less than min team size",
    ),
    ["minTeamSize"],
  ),
  v.forward(
    v.partialCheck(
      [["lowerRankLimit"], ["upperRankLimit"]],
      (input) => {
        return input.upperRankLimit === null || input.lowerRankLimit !== null;
      },
      "Lower rank limit must be defined",
    ),
    ["lowerRankLimit"],
  ),
  v.forward(
    v.partialCheck(
      [["lowerRankLimit"], ["upperRankLimit"]],
      (input) => {
        if (!!input.upperRankLimit && !!input.lowerRankLimit) {
          return input.upperRankLimit >= input.lowerRankLimit;
        }
        return true;
      },
      "Upper rank limit must be greater than lower rank limit",
    ),
    ["upperRankLimit"],
  ),
);

const updateSchema = createUpdateSchema(tournaments, {
  name: (schema) => v.pipe(schema, v.minLength(2, "Input must have 2 character(s) or more.")),
  slug: (schema) => v.pipe(schema, v.minLength(2, "Input must have 2 character(s) or more.")),
  acronym: (schema) => v.pipe(schema, v.minLength(2, "Input must have 2 character(s) or more.")),
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
      v.check((input) => {
        if (input?.type === "linear") {
          return input.z === 1;
        }
        return true;
      }, "Invalid BWS formula parameters"),
    ),
  }),
  v.forward(
    v.check((input) => {
      if (!input.maxTeamSize || !input.minTeamSize) {
        return true;
      }
      return input.maxTeamSize >= input.minTeamSize;
    }, "Max team size cannot be less than min team size"),
    ["minTeamSize"],
  ),
  v.forward(
    v.check((input) => {
      if (input.type === "teams") {
        return input.maxTeamSize !== 1 || input.minTeamSize !== 1;
      }
      return true;
    }, "Team size cannot be 1 for non-team tournaments"),
    ["maxTeamSize"],
  ),
  v.forward(
    v.partialCheck(
      [["lowerRankLimit"], ["upperRankLimit"]],
      (input) => {
        return input.lowerRankLimit === null || input.upperRankLimit !== null;
      },
      "Lower rank limit must be defined",
    ),
    ["lowerRankLimit"],
  ),
  v.forward(
    v.partialCheck(
      [["upperRankLimit"], ["lowerRankLimit"]],
      (input) => {
        if (!!input.upperRankLimit && !!input.lowerRankLimit) {
          console.log(input.upperRankLimit, input.lowerRankLimit);
          return input.upperRankLimit < input.lowerRankLimit;
        }
        return true;
      },
      "Upper rank limit must be greater than lower rank limit",
    ),
    ["upperRankLimit"],
  ),
);

export const updateTournamentApiSchema = v.pipe(
  updateTournamentSchema,
  v.check((input) => {
    if (!input.name?.trim()) return false;
    if (!input.slug?.trim()) return false;
    if (!input.acronym?.trim()) return false;
    return true;
  }, "Name, slug, and acronym are required"),
);

export type UpdateTournament = v.InferOutput<typeof updateTournamentSchema>;
export type UpdateTournamentApi = v.InferOutput<typeof updateTournamentApiSchema>;

export const selectTournamentSchema = createSelectSchema(tournaments, {
  bwsSettings: v.nullable(bwsSettingsSchema),
  banner: v.nullable(v.pipe(v.string(), v.url())),
  logo: v.nullable(v.pipe(v.string(), v.url())),
});

export const tournamentSchema = v.object({
  ...selectTournamentSchema.entries,
  tournamentDates: tournamentDatesSchema,
});

export type Tournament = v.InferOutput<typeof tournamentSchema>;
