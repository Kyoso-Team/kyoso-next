import type { EventHandlerRequest, H3Event } from "h3";

import type { AppSession } from "#nuxt-better-auth";

export type ProtectedEventHandler<T extends EventHandlerRequest, D> = (
  event: H3Event<T>,
  data: {
    session: AppSession;
  },
) => Promise<D>;

export function defineProtectedEventHandler<T extends EventHandlerRequest, D>(
  handler: ProtectedEventHandler<T, D>,
) {
  return defineEventHandler({
    handler: async (event) => {
      const session = await requireUserSession(event);

      return await handler(event, {
        session,
      });
    },
  });
}
