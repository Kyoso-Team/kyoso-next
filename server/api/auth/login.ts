import { generateState } from "arctic";
import { redisStateKey } from "~~/server/utils/oauth";

export default defineEventHandler(async (event) => {
  const state = generateState();

  const osuAuthUrl = osuOAuth.createAuthorizationURL(state, ["identify", "public"]);

  await useStorage("redis").setItem(redisStateKey("osu", state), 1, { ttl: 300 });

  await sendRedirect(event, osuAuthUrl.href, 302);
});
