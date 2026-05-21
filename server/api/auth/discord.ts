import { generateState } from "arctic";
import { redisStateKey } from "~~/server/utils/oauth";

export default defineEventHandler(async (event) => {
  const state = generateState();

  const discordAuthUrl = discordOAuth.createAuthorizationURL(state, null, ["identify"]);

  await useStorage("redis").setItem(redisStateKey("discord", state), 1, { ttl: 300 });

  await sendRedirect(event, discordAuthUrl.href, 302);
});
