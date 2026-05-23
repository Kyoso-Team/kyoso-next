import * as v from "valibot";
import { db } from "~~/server/database/client";
import { tournaments } from "~~/server/database/schema";
import { createTournamentSchema } from "~~/shared/validation/tournaments";

export default defineProtectedEventHandler(async (event, { session }) => {
  const body = await readValidatedBody(event, (body) => v.parse(createTournamentSchema, body));

  return db.insert(tournaments).values({
    ...body,
    hostUserId: session.user.id,
  });
});
