import dayjs from "dayjs";
import { db } from "~~/server/database/client";
import { tournamentParticipants } from "~~/server/database/schema";
import { defineProtectedTournamentHandler } from "~~/server/utils/handlers/protected/tournament.handler";

export default defineProtectedTournamentHandler(async (_, { tournament, session }) => {
  if (dayjs().isAfter(tournament.playerRegistrationEnd)) {
    throw createError({ statusCode: 403, message: "Registration has ended" });
  }

  const existingRegistration = await db.query.tournamentParticipants.findFirst({
    where: {
      tournamentId: tournament.id,
      userId: session.user.id,
    },
    columns: {
      id: true,
    },
  });

  if (existingRegistration) {
    throw createError({
      statusCode: 400,
      message: "You are already registered for this tournament",
    });
  }

  await db.insert(tournamentParticipants).values({
    username: session.user.osu.username,
    tournamentId: tournament.id,
    userId: session.user.id,
    osuId: session.user.osu.osuId,
    countryCode: session.user.osu.countryCode,
  });
});
