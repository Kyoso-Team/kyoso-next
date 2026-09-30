import { and, eq } from "drizzle-orm";
import * as v from "valibot";
import { db } from "~~/server/database/client";
import { tournamentRounds } from "~~/server/database/schema";
import { tournamentRoundUpdateSchema } from "~~/shared/validation/tournament/rounds";

export default defineTournamentAccessHandler(async (event, { tournament }) => {
  const { id: roundId } = await getValidatedRouterParams(event, (params) =>
    v.parse(
      v.object({
        id: v.pipe(v.string(), v.toNumber()),
      }),
      params,
    ),
  );

  const body = await readValidatedBody(event, (body) => v.parse(tournamentRoundUpdateSchema, body));

  try {
    const result = await db
      .update(tournamentRounds)
      .set(body)
      .where(
        and(eq(tournamentRounds.id, roundId), eq(tournamentRounds.tournamentId, tournament.id)),
      )
      .returning({ id: tournamentRounds.id });

    if (result.length === 0) {
      throw createError({ statusCode: 404, message: "Round not found" });
    }
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      throw createError({
        statusCode: 409,
        message: "Only one qualifiers round is allowed per tournament",
      });
    }
    throw error;
  }
});
