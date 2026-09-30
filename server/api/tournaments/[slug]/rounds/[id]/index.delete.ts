import { and, eq } from "drizzle-orm";
import * as v from "valibot";
import { db } from "~~/server/database/client";
import { tournamentRounds } from "~~/server/database/schema";

export default defineTournamentAccessHandler(async (event, { tournament }) => {
  const { id: roundId } = await getValidatedRouterParams(event, (params) =>
    v.parse(
      v.object({
        id: v.pipe(v.string(), v.toNumber()),
      }),
      params,
    ),
  );

  const result = await db
    .delete(tournamentRounds)
    .where(and(eq(tournamentRounds.id, roundId), eq(tournamentRounds.tournamentId, tournament.id)))
    .returning({ id: tournamentRounds.id });

  if (result.length === 0) {
    throw createError({ statusCode: 404, message: "Round not found" });
  }
});
