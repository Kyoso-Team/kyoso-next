import * as v from "valibot";
import { db } from "~~/server/database/client";
import { tournaments } from "~~/server/database/schema";
import { createTournamentSchema } from "~~/shared/validation/tournaments";

export default defineProtectedEventHandler(async (event, { session }) => {
  const body = await readValidatedBody(event, (body) => v.parse(createTournamentSchema, body));

  return db.insert(tournaments).values({
    ...body,
    bwsSettings: {
      x: 0.9937,
      y: 2,
      z: 1,
      type: "linear",
      year: null,
    },
    hostUserId: session.user.id,
  });
});
