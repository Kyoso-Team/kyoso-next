import { eq, sql } from "drizzle-orm";
import * as v from "valibot";
import { db } from "~~/server/database/client";
import type { MappoolEntry } from "~~/server/database/schema";
import { tournamentMappoolEntry } from "~~/server/database/schema";
import type { SessionPayload } from "~~/server/utils/auth";
import { strippedMappoolEntryUpdateSchema } from "~~/shared/validation/tournament/mappools";

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

  const body = await readValidatedBody(event, (body) =>
    v.parse(strippedMappoolEntryUpdateSchema, body),
  );

  const suggestion = await db.query.tournamentMappoolEntry.findFirst({
    where: {
      id,
    },
  });

  const { existingSuggestion } = await checkSuggestion(suggestion, session);

  const affectedIds: number[] = [];

  await db.transaction(async (tx) => {
    if (body.position && body.slot) {
      const takenSlot = await tx.query.tournamentMappoolEntry.findFirst({
        where: {
          slot: body.slot,
          position: body.position,
          roundId: existingSuggestion.roundId,
          id: {
            NOT: {
              eq: existingSuggestion.id,
            },
          },
        },
        columns: {
          id: true,
          slot: true,
          position: true,
        },
      });

      if (takenSlot) {
        await tx.execute(sql`SET CONSTRAINTS ALL DEFERRED`);
        await tx
          .update(tournamentMappoolEntry)
          .set({
            slot: existingSuggestion.slot ?? null,
            position: existingSuggestion.position ?? null,
          })
          .where(eq(tournamentMappoolEntry.id, takenSlot.id));
        affectedIds.push(takenSlot.id);
      }
    }

    await tx
      .update(tournamentMappoolEntry)
      .set(body)
      .where(eq(tournamentMappoolEntry.id, existingSuggestion.id));
    affectedIds.push(existingSuggestion.id);
  });

  return {
    affectedIds,
  };
});
