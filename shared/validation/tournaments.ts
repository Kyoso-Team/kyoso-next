import { createInsertSchema } from "drizzle-orm/valibot";
import * as v from "valibot";
import { tournaments } from "~~/server/database/schema";

const initialUndefinedSchema = <TSchema extends v.GenericSchema>(schema: TSchema) =>
  v.pipe(v.union([v.undefined(), schema]), schema);

const schema = createInsertSchema(tournaments, {
  name: (schema) => v.pipe(schema, v.minLength(2, "Input must have 2 character(s) or more.")),
  slug: (schema) => v.pipe(schema, v.minLength(2, "Input must have 2 character(s) or more.")),
  acronym: (schema) => v.pipe(schema, v.minLength(2, "Input must have 2 character(s) or more.")),
  type: (schema) => initialUndefinedSchema(schema),
  minTeamSize: initialUndefinedSchema(v.number("Min team size is required")),
  maxTeamSize: initialUndefinedSchema(v.number("Max team size is required")),
});

const { name, slug, acronym, type, minTeamSize, maxTeamSize, lowerRankLimit, upperRankLimit } =
  schema.entries;

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
