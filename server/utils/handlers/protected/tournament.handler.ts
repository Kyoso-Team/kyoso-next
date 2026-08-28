import type { EventHandlerRequest, H3Event } from "h3";
import type { TournamentSelect } from "~~/server/database/schema";
import { getTournament } from "~~/server/utils/handlers/public/tournament.handler";

type ProtectedTournamentHandler<T extends EventHandlerRequest, D> = (
  event: H3Event<T>,
  data: {
    session: SessionPayload;
    tournament: TournamentSelect;
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
