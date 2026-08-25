import { createError } from "evlog";
import * as v from "valibot";
import { db } from "~~/server/database/client";
import { discordUsers } from "~~/server/database/schema";
import { defineProtectedEventHandler } from "~~/server/utils/handlers/auth.handler";
import { redisStateKey } from "~~/server/utils/oauth";
import { oauthCallbackQuerySchema } from "~~/server/utils/validation/common";

export default defineProtectedEventHandler(async (event, { session }) => {
  const { code, state } = await getValidatedQuery(event, (query) => {
    const parse = v.safeParse(oauthCallbackQuerySchema, query);

    if (!parse.success) {
      return sendRedirect(event, "/login");
    }

    return parse.output;
  });

  const stateKey = redisStateKey("discord", state);

  const isValidState = await useStorage("redis").getItem(stateKey);

  if (!isValidState) {
    throw createError({
      status: 401,
      message: "Invalid state",
    });
  }

  await useStorage("redis").removeItem(stateKey);

  const token = await discordOAuth.validateAuthorizationCode(code, null);

  const response = await $fetch<{ id: string; username: string }>(
    "https://discord.com/api/users/@me",
    {
      headers: {
        Authorization: `Bearer ${token.accessToken()}`,
      },
    },
  ).catch((e: Error) => {
    throw createError({
      status: 500,
      message: "Failed to fetch discord user data",
      why: e.message,
      cause: e,
    });
  });

  const { id, username } = response;

  await db
    .insert(discordUsers)
    .values({
      discordId: id,
      username,
      userId: session.user.id,
    })
    .returning(pick(discordUsers, { id: true, username: true }))
    .then((user) => user[0]!);

  return await sendRedirect(event, "/profile", 302);
});
