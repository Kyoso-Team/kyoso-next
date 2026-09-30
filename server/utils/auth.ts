import type { AuthSession } from "#nuxt-better-auth";
import type { AuthUser } from "#nuxt-better-auth";

export type SessionPayload = {
  session: AuthSession;
  user: AuthUser;
};
