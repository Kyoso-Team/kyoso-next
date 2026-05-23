import { createInsertSchema } from "drizzle-orm/valibot";
import * as v from "valibot";
import { tournaments } from "~~/server/database/schema";

const initialNullSchema = <TSchema extends v.GenericSchema>(schema: TSchema) =>
  v.pipe(v.nullable(schema), schema);

const schema = createInsertSchema(tournaments, {
  name: (schema) => v.pipe(schema, v.minLength(2, "Input must have 2 character(s) or more.")),
  slug: (schema) => v.pipe(schema, v.minLength(2, "Input must have 2 character(s) or more.")),
  acronym: (schema) => v.pipe(schema, v.minLength(2, "Input must have 2 character(s) or more.")),
  type: (schema) => initialNullSchema(schema),
  minTeamSize: (schema) => initialNullSchema(schema),
  maxTeamSize: (schema) => initialNullSchema(schema),
  lowerRankLimit: (schema) => initialNullSchema(schema),
  upperRankLimit: (schema) => initialNullSchema(schema),
});

const { name, slug, acronym, type, minTeamSize, maxTeamSize, lowerRankLimit, upperRankLimit } =
  schema.entries;

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
    v.check(
      (input) => input.maxTeamSize >= input.minTeamSize,
      "Max team size cannot be less than min team size",
    ),
    ["minTeamSize"],
  ),
  v.forward(
    v.partialCheck(
      [["lowerRankLimit"], ["upperRankLimit"]],
      (input) => {
        return input.upperRankLimit === null || input.lowerRankLimit !== undefined;
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
