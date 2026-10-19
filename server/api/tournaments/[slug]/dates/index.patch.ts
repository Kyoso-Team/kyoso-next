import { eq, sql } from "drizzle-orm";
import * as v from "valibot";
import { db } from "~~/server/database/client";
import { tournamentDates, tournaments } from "~~/server/database/schema";
import type { Nullish } from "~~/shared/types";
import { parseUTCDate, parseUTCDateTime } from "~~/shared/utils/date";
import { tournamentDatesFormSchema } from "~~/shared/validation/tournament/dates";

const toDatabaseDateTime = (value: Nullish<string>) =>
  value ? new Date(parseUTCDateTime(value).epochMilliseconds) : null;

const toDatabaseDate = (value: string): Date =>
  value.includes("T")
    ? new Date(parseUTCDateTime(value).epochMilliseconds)
    : new Date(parseUTCDate(value).toZonedDateTime("UTC").epochMilliseconds);

export default defineTournamentAccessHandler(async (event, { tournament }) => {
  const body = await readValidatedBody(event, (body) => v.parse(tournamentDatesFormSchema, body));

  const { playerRegs, staffRegs, dates } = body;

  if (playerRegs || staffRegs) {
    await db
      .update(tournaments)
      .set({
        playerRegistrationStart: playerRegs?.start
          ? toDatabaseDateTime(playerRegs?.start)
          : undefined,
        playerRegistrationEnd: playerRegs?.end ? toDatabaseDateTime(playerRegs?.end) : undefined,
        staffRegistrationStart: staffRegs?.start ? toDatabaseDateTime(staffRegs?.start) : undefined,
        staffRegistrationEnd: staffRegs?.end ? toDatabaseDateTime(staffRegs?.end) : undefined,
      })
      .where(eq(tournaments.slug, tournament.slug));
  }

  const newTournamentDates = (dates ?? []).map<typeof tournamentDates.$inferInsert>((date) => {
    return {
      tournamentId: tournament.id,
      label: date.label,
      type: date.type,
      startDate: toDatabaseDate(date.start),
      endDate: toDatabaseDate(date.end),
    };
  });

  if (newTournamentDates.length > 0) {
    await db
      .insert(tournamentDates)
      .values(newTournamentDates)
      .onConflictDoUpdate({
        target: [tournamentDates.label, tournamentDates.tournamentId],
        set: {
          label: sql`excluded.label`,
          type: sql`excluded.type`,
          startDate: sql`excluded.start_date`,
          endDate: sql`excluded.end_date`,
        },
      });
  }
});
