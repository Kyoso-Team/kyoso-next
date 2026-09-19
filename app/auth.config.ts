import { defineClientAuth } from "@nuxtjs/better-auth/config";
import { customSessionClient } from "better-auth/client/plugins";
import type serverAuth from "~~/server/auth.config";

type ServerAuthConfig = ReturnType<typeof serverAuth>;

export default defineClientAuth({
  // @ts-expect-error
  plugins: [customSessionClient<ServerAuthConfig>()],
});
