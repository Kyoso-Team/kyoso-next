import { useLogger } from "evlog/nitro";
import type { EventHandlerRequest, H3Event } from "h3";
import { db } from "~~/server/database/client";
import type { TournamentSelect } from "~~/server/database/schema";

export async function getTournament<T extends EventHandlerRequest>(
  event: H3Event<T>,
): Promise<TournamentSelect> {
  const log = useLogger(event);

  const tournamentSlug = getRouterParam(event, "slug");

  if (!tournamentSlug) {
    throw createError({
      statusCode: 400,
      message: "URL param 'slug' not defined",
    });
  }

  log.set({
    tournament: { slug: tournamentSlug },
  });

  const tournament = await db.query.tournaments.findFirst({
    where: {
      slug: tournamentSlug,
    },
  });

  if (!tournament) {
    throw createError({
      statusCode: 404,
      message: "Tournament not found",
    });
  }

  return tournament;
}

type TournamentHandler<T extends EventHandlerRequest, D> = (
  event: H3Event<T>,
  data: {
    tournament: TournamentSelect;
  },
) => Promise<D>;

export function defineTournamentHandler<T extends EventHandlerRequest, D>(
  handler: TournamentHandler<T, D>,
) {
  return defineEventHandler({
    handler: async (event) => {
      return await handler(event, { tournament: await getTournament(event) });
    },
  });
}
