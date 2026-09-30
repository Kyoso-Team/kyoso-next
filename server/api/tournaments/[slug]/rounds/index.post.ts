import { DrizzleError } from "drizzle-orm";
import * as v from "valibot";
import { db } from "~~/server/database/client";
import { tournamentRounds } from "~~/server/database/schema";
import { tournamentRoundUpdateSchema } from "~~/shared/validation/tournament/rounds";

export default defineTournamentAccessHandler(async (event, { tournament }) => {
  const body = await readValidatedBody(event, (input) =>
    v.parse(tournamentRoundUpdateSchema, input),
  );

  await db
    .insert(tournamentRounds)
    .values({ ...body, tournamentId: tournament.id })
    .catch((e) => {
      if (e instanceof DrizzleError) {
        throw createError({
          statusCode: 409,
          message: "Only one qualifiers round is allowed per tournament",
        });
      }
      throw e;
    });
});
