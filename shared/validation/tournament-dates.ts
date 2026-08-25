import { createInsertSchema } from "drizzle-orm/valibot";
import * as v from "valibot";
import { tournamentDates } from "~~/server/database/schema";
import { parseUTCDate, parseUTCDateTime } from "~~/shared/utils/date";

const dateTimeSchema = () => v.pipe(v.string(), v.isoTimestamp("Invalid date and time"));

const calendarDateSchema = (message: string) =>
  v.pipe(v.string(message), v.nonEmpty(message), v.isoDate("Invalid date"));

const dateSchema = v.object({
  start: v.nullish(dateTimeSchema()),
  end: v.nullish(dateTimeSchema()),
});

const createSchema = createInsertSchema(tournamentDates, {
  label: v.pipe(
    v.string("Label required"),
    v.minLength(2, "Label must be at least 2 characters long."),
  ),
  type: (schema) => v.pipe(schema, v.nonEmpty("Date type is required")),
});

const tournamentDateFields = v.object({
  ...v.pick(createSchema, ["label", "type"]).entries,
  start: calendarDateSchema("Start date required"),
  end: calendarDateSchema("End date required"),
});

export const tournamentDateCreateSchema = v.pipe(
  tournamentDateFields,
  v.partialCheck(
    [["start"], ["end"]],
    (input) => parseUTCDate(input.start).compare(parseUTCDate(input.end)) <= 0,
    "Start date must be before end date.",
  ),
);
export type TournamentDateCreate = v.InferOutput<typeof tournamentDateCreateSchema>;

export const tournamentDatesSchema = v.object({
  playerRegs: v.nullish(dateSchema),
  staffRegs: v.nullish(dateSchema),
  dates: v.optional(
    v.array(
      v.object({
        id: v.nullish(v.number()),
        ...tournamentDateFields.entries,
      }),
    ),
  ),
});
export type TournamentDates = v.InferOutput<typeof tournamentDatesSchema>;

const isValidDateRange = (start: string | null | undefined, end: string | null | undefined) => {
  if (start == null || end == null) return true;
  return parseUTCDateTime(start).compare(parseUTCDateTime(end)) <= 0;
};

export const tournamentDatesFormSchema = v.pipe(
  tournamentDatesSchema,
  v.check(
    (input) => isValidDateRange(input.playerRegs?.start, input.playerRegs?.end),
    "Player registration dates must be valid.",
  ),
  v.check(
    (input) => isValidDateRange(input.staffRegs?.start, input.staffRegs?.end),
    "Staff registration dates must be valid.",
  ),
);
export type TournamentDatesForm = v.InferOutput<typeof tournamentDatesFormSchema>;

export const updateTournamentDatesSchema = v.partial(tournamentDatesSchema);
export type UpdateTournamentDates = v.InferOutput<typeof updateTournamentDatesSchema>;
