import { eq } from "drizzle-orm";
import * as v from "valibot";
import { db } from "~~/server/database/client";
import { tournaments } from "~~/server/database/schema";
import { updateTournamentSchema } from "~~/shared/validation/tournaments";

export default defineTournamentAccessHandler(async (event, { tournament }) => {
  const body = await readValidatedBody(event, (body) => v.parse(updateTournamentSchema, body));

  await db.update(tournaments).set(body).where(eq(tournaments.slug, tournament.slug));
});
