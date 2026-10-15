import { db } from "~~/server/database/client";

export default defineProtectedTournamentHandler(async (_, { tournament }) => {
  const rows = await db.query.tournamentRounds.findMany({
    where: {
      tournamentId: tournament.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const rounds = rows.flatMap((row) =>
    row.config === null ? [] : [{ ...row, config: row.config }],
  );

  return rounds;
});
