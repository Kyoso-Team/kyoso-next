import { db } from "~~/server/database/client";

export default defineProtectedTournamentHandler(async (_, { session, tournament }) => {
  return await db.query.tournamentParticipants.findFirst({
    where: {
      tournamentId: tournament.id,
      userId: session.user.id,
    },
  });
});
