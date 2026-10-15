import { eq } from "drizzle-orm";
import * as v from "valibot";
import { db } from "~~/server/database/client";
import type { MappoolEntry } from "~~/server/database/schema";
import { tournamentMappoolEntry } from "~~/server/database/schema";
import type { SessionPayload } from "~~/server/utils/auth";

const checkSuggestion = async (suggestion: MappoolEntry | undefined, session: SessionPayload) => {
  if (!suggestion) {
    throw createError({
      status: 404,
      message: "Suggestion not found",
    });
  }

  if (suggestion.submittedByUserId !== Number(session.user.id)) {
    throw createError({
      status: 403,
      message: "Can only update own suggestions",
    });
  }

  return { existingSuggestion: suggestion };
};

export default defineProtectedTournamentHandler(async (event, { session }) => {
  const { id } = await getValidatedRouterParams(event, (params) =>
    v.parse(
      v.object({
        id: v.pipe(v.string(), v.toNumber()),
      }),
      params,
    ),
  );

  const suggestion = await db.query.tournamentMappoolEntry.findFirst({
    where: {
      id,
    },
  });

  const { existingSuggestion } = await checkSuggestion(suggestion, session);

  await db
    .delete(tournamentMappoolEntry)
    .where(eq(tournamentMappoolEntry.id, existingSuggestion.id));
});
