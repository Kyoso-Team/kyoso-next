import { useLogger } from "evlog/nitro";
import type { EventHandlerRequest, H3Event } from "h3";

export type ProtectedEventHandler<T extends EventHandlerRequest, D> = (
  event: H3Event<T>,
  data: {
    session: SessionPayload;
  },
) => Promise<D>;

export function defineProtectedEventHandler<T extends EventHandlerRequest, D>(
  handler: ProtectedEventHandler<T, D>,
) {
  return defineEventHandler({
    handler: async (event) => {
      const log = useLogger(event);

      const session = await getCookieSession(event);

      if (!session) {
        throw createError({
          status: 401,
          statusMessage: "Unauthorized",
        });
      }

      log.set({
        user: { osuId: session.user.osu.osuId },
      });

      return await handler(event, { session: { ...session } });
    },
  });
}
