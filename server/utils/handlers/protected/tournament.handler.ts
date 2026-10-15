import type { EventHandlerRequest, H3Event } from "h3";
import { getTournament } from "~~/server/utils/handlers/public/tournament.handler";

type ProtectedTournamentHandler<T extends EventHandlerRequest, D> = (
  event: H3Event<T>,
  data: {
    session: SessionPayload;
    tournament: Awaited<ReturnType<typeof getTournament>>;
  },
) => Promise<D>;

export function defineProtectedTournamentHandler<T extends EventHandlerRequest, D>(
  handler: ProtectedTournamentHandler<T, D>,
) {
  return defineEventHandler({
    handler: defineProtectedEventHandler(async (event, { session }) => {
      const tournament = await getTournament(event);
      return await handler(event, { session, tournament });
    }),
  });
}
