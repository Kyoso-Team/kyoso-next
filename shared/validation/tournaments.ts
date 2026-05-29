import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/valibot";
import * as v from "valibot";
import { tournaments } from "~~/server/database/schema";
import { bwsSettingsSchema } from "~~/server/utils/validation/tournament";

const initialUndefinedSchema = <TSchema extends v.GenericSchema>(schema: TSchema) =>
  v.pipe(v.union([v.undefined(), schema]), schema);

const createSchema = createInsertSchema(tournaments, {
  name: (schema) => v.pipe(schema, v.minLength(2, "Input must have 2 character(s) or more.")),
  slug: (schema) => v.pipe(schema, v.minLength(2, "Input must have 2 character(s) or more.")),
  acronym: (schema) => v.pipe(schema, v.minLength(2, "Input must have 2 character(s) or more.")),
  type: (schema) => initialUndefinedSchema(schema),
  minTeamSize: initialUndefinedSchema(v.number("Min team size is required")),
  maxTeamSize: initialUndefinedSchema(v.number("Max team size is required")),
});

const { name, slug, acronym, type, minTeamSize, maxTeamSize, lowerRankLimit, upperRankLimit } =
  createSchema.entries;

export const createTournamentSchema = v.pipe(
  v.object({
    name,
    slug,
    acronym,
    type,
    minTeamSize: initialUndefinedSchema(minTeamSize),
    maxTeamSize: initialUndefinedSchema(maxTeamSize),
    lowerRankLimit,
    upperRankLimit,
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
  minTeamSize: v.pipe(v.number("Min team size is required"), v.minValue(1), v.maxValue(16)),
  maxTeamSize: v.pipe(
    v.number("Max team size is required"),
    v.minValue(1),
    v.maxValue(16, "Max team size cannot be greater than 16"),
  ),
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

    bwsSettings: v.nullish(bwsSettingsSchema),
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
});
export type Tournament = v.InferOutput<typeof selectTournamentSchema>;
