import { createInsertSchema, createSelectSchema } from "drizzle-orm/valibot";
import * as v from "valibot";
import { tournamentDates } from "~~/server/database/schema";

const dateSchema = v.object({
  start: v.date(),
  end: v.date(),
});

export const tournamentDatesSchema = v.object({
  playerRegs: v.nullish(dateSchema),
  staffRegs: v.nullish(dateSchema),
  dates: v.array(
    v.pick(createSelectSchema(tournamentDates), ["id", "type", "label", "startDate", "endDate"]),
  ),
});
export type TournamentDates = v.InferOutput<typeof tournamentDatesSchema>;

export const tournamentDateCreateSchema = v.pipe(
  v.object(
    v.pick(
      createInsertSchema(tournamentDates, {
        startDate: v.pipe(v.string("Start date required"), v.toDate("Invalid date")),
        endDate: v.pipe(v.string("End date required"), v.toDate("Invalid date")),
        label: v.pipe(
          v.string("Label required"),
          v.minLength(2, "Label must be at least 2 characters long."),
        ),
        type: (schema) => v.pipe(schema, v.nonEmpty("Date type is required")),
      }),
      ["label", "type", "startDate", "endDate"],
    ).entries,
  ),
  v.check((input) => {
    console.log(input);
    return new Date(input.startDate) <= new Date(input.endDate);
  }, "Start date must be before end date."),
);
export type TournamentDateCreate = v.InferOutput<typeof tournamentDateCreateSchema>;

export const tournamentDatesFormSchema = v.pipe(
  tournamentDatesSchema,
  v.check((input) => {
    console.log(input);

    if (input.playerRegs) {
      return input.playerRegs.start <= input.playerRegs.end;
    }

    return true;
  }, "Player registration dates must be valid."),
);
export type TournamentDatesForm = v.InferOutput<typeof tournamentDatesFormSchema>;

export const updateTournamentDatesSchema = v.partial(tournamentDatesSchema);
export type UpdateTournamentDates = v.InferOutput<typeof updateTournamentDatesSchema>;
