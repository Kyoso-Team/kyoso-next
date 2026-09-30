import { db } from "~~/server/database/client";

const typeOrder = { qualifiers: 0, groups: 1, bracket: 2 } as const;

export default defineProtectedTournamentHandler(async (_, { tournament }) => {
  const rows = await db.query.tournamentRounds.findMany({
    where: {
      tournamentId: tournament.id,
    },
  });

  const rounds = rows.flatMap((row) =>
    row.config === null ? [] : [{ ...row, config: row.config }],
  );
  rounds.sort((a, b) => typeOrder[a.config.type] - typeOrder[b.config.type] || a.id - b.id);

  return { rounds };
});
