import { createInsertSchema, createUpdateSchema } from "drizzle-orm/valibot";
import * as v from "valibot";
import { tournamentMappoolEntry } from "~~/server/database/schema";

const statOverrideSchema = v.partial(
  v.object({
    cs: v.number(),
    ar: v.number(),
    od: v.number(),
    clockRate: v.number(),
  }),
);

export const mappoolEntryCreateSchema = createInsertSchema(tournamentMappoolEntry, {
  statOverrides: v.optional(statOverrideSchema),
});

export const mappoolEntryUpdateSchema = createUpdateSchema(tournamentMappoolEntry, {
  statOverrides: v.optional(statOverrideSchema),
  poolingNote: v.optional(v.nullable(v.string())),
});
export const strippedMappoolEntryUpdateSchema = v.omit(mappoolEntryUpdateSchema, [
  "submittedByUserId",
  "beatmapId",
]);

export type UpdateMappoolEntry = v.InferOutput<typeof strippedMappoolEntryUpdateSchema>;
