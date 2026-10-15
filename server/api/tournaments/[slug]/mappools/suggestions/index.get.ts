import * as v from "valibot";
import { db } from "~~/server/database/client";

const queryParamsSchema = v.partial(
  v.object({
    roundId: v.pipe(v.string(), v.toNumber()),
  }),
);

export default defineProtectedTournamentHandler(async (event, { tournament }) => {
  const queryParams = await getValidatedQuery(event, (query) => v.parse(queryParamsSchema, query));

  if (!queryParams.roundId && !tournament.activeRound) {
    return [];
  }

  const mappoolEntries = await db.query.tournamentMappoolEntry.findMany({
    where: {
      roundId: queryParams.roundId ?? tournament.activeRound?.id,
    },
    with: {
      beatmap: true,
      submittedByUser: {
        columns: {
          osuId: true,
          username: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  mappoolEntries.map((entry) => {
    return {
      ...entry,
      beatmap: {
        ...entry.beatmap,
        ...entry.statOverrides,
      },
    };
  });

  return mappoolEntries;
});
