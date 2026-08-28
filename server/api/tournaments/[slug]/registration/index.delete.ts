import dayjs from "dayjs";
import { and, eq } from "drizzle-orm";
import { db } from "~~/server/database/client";
import { tournamentParticipants } from "~~/server/database/schema";
import { defineProtectedTournamentHandler } from "~~/server/utils/handlers/protected/tournament.handler";

export default defineProtectedTournamentHandler(async (_, { tournament, session }) => {
  const existingRegistration = await db.query.tournamentParticipants.findFirst({
    where: {
      tournamentId: tournament.id,
      userId: session.user.id,
    },
    columns: {
      id: true,
    },
  });

  if (!existingRegistration) {
    throw createError({ statusCode: 404, message: "You are not registered for this tournament" });
  }

  if (dayjs().isAfter(tournament.playerRegistrationEnd)) {
    throw createError({ statusCode: 403, message: "Registration has ended" });
  }

  await db
    .delete(tournamentParticipants)
    .where(
      and(
        eq(tournamentParticipants.tournamentId, tournament.id),
        eq(tournamentParticipants.userId, session.user.id),
      ),
    );
});
