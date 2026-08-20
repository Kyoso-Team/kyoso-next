import { eq } from "drizzle-orm";
import * as v from "valibot";
import { db } from "~~/server/database/client";
import { tournaments } from "~~/server/database/schema";
import { updateTournamentSchema } from "~~/shared/validation/tournaments";

export default defineTournamentAccessHandler(async (event, { tournament }) => {
  const body = await readValidatedBody(event, (b) => v.parse(updateTournamentSchema, b));

  const existingTournament = await db.query.tournaments.findFirst({
    where: {
      slug: tournament.slug,
    },
  });

  const tournamentEntry = {
    ...existingTournament,
    ...body,
  };

  const validatedTournament = v.safeParse(updateTournamentSchema, tournamentEntry);

  if (!validatedTournament.success) {
    throw createError({
      statusCode: 500,
      message: `Something went wrong, please report the issue to the developer`,
    });
  }

  const { output } = validatedTournament;

  if (output.type === "solo") {
    body.maxTeamSize = null;
    body.minTeamSize = null;
  }

  await db
    .update(tournaments)
    .set({
      ...body,
    })
    .where(eq(tournaments.slug, tournament.slug));
});
