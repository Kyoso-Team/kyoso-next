import { and, eq, or, sql } from "drizzle-orm";
import { useLogger } from "evlog";
import type { H3Event } from "h3";
import { db } from "~~/server/database/client";
import { tournamentAccess, tournaments } from "~~/server/database/schema";

type TournamentAccessEventHandler<T extends EventHandlerRequest, D> = (
  event: H3Event<T>,
  data: {
    sessionPayload: SessionPayload;
    tournament: Awaited<ReturnType<typeof validateTournamentAccess>>;
  },
) => Promise<D>;

export const validateTournamentAccess = async (session: SessionPayload, slug: string) => {
  const result = await db
    .select({
      tournament: {
        ...pick(tournaments, {
          id: true,
          slug: true,
          name: true,
          acronym: true,
          type: true,
          minTeamSize: true,
          maxTeamSize: true,
          lowerRankLimit: true,
          upperRankLimit: true,
          bwsSettings: true,
          banner: true,
          logo: true,
        }),
      },
      exists: sql<boolean>`exists (select 1 from ${tournaments} where ${eq(tournaments.slug, slug)})`,
      hasAccess: sql<boolean>`exists(select 1
                        from ${tournaments}
                                 left join ${tournamentAccess} on ${tournamentAccess.tournamentId} = ${tournaments.id}
                        where ${and(eq(tournaments.slug, slug), or(eq(tournamentAccess.userId, session.user.id), eq(tournaments.hostUserId, session.user.id)))})`,
    })
    .from(tournaments)
    .leftJoin(
      tournamentAccess,
      and(
        eq(tournamentAccess.tournamentId, tournaments.id),
        eq(tournamentAccess.userId, session.user.id),
      ),
    )
    .where(eq(tournaments.slug, slug))
    .then((result) => result[0]);

  if (!result) {
    throw createError({
      statusCode: 404,
      message: "Tournament does not exist",
    });
  }

  if (!result.hasAccess) {
    throw createError({
      statusCode: 403,
      message: "Forbidden",
    });
  }

  return result.tournament;
};

export function defineTournamentAccessHandler<T extends EventHandlerRequest, D>(
  handler: TournamentAccessEventHandler<T, D>,
) {
  return defineEventHandler({
    handler: defineProtectedEventHandler(async (event, { session }) => {
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

      const tournament = await validateTournamentAccess(session, tournamentSlug);
      return handler(event, { sessionPayload: session, tournament });
    }),
  });
}
