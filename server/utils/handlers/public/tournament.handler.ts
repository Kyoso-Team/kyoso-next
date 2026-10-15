import { useLogger } from "evlog/nitro";
import type { EventHandlerRequest, H3Event } from "h3";
import { db } from "~~/server/database/client";

export async function getTournament<T extends EventHandlerRequest>(event: H3Event<T>) {
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
    with: {
      rounds: {
        columns: {
          id: true,
        },
        orderBy: {
          id: "desc",
        },
        limit: 1,
      },
    },
  });

  if (!tournament) {
    throw createError({
      statusCode: 404,
      message: "Tournament not found",
    });
  }

  return {
    ...tournament,
    activeRound: tournament.rounds.length > 0 ? tournament.rounds[0]! : null,
  };
}

type TournamentHandler<T extends EventHandlerRequest, D> = (
  event: H3Event<T>,
  data: {
    tournament: Awaited<ReturnType<typeof getTournament>>;
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
