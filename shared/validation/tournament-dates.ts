import { createSelectSchema } from "drizzle-orm/valibot";
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

export const tournamentDatesFormSchema = v.pipe(
  tournamentDatesSchema,
  v.check((input) => {
    if (input.playerRegs) {
      return input.playerRegs.start <= input.playerRegs.end;
    }

    return true;
  }, "Player registration dates must be valid."),
);
export type TournamentDatesForm = v.InferOutput<typeof tournamentDatesFormSchema>;

export const updateTournamentDatesSchema = v.partial(tournamentDatesSchema);
export type UpdateTournamentDates = v.InferOutput<typeof updateTournamentDatesSchema>;
