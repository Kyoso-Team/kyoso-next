import { Discord } from "arctic";

const runtimeConfig = useRuntimeConfig();

export const discordOAuth = new Discord(
  runtimeConfig.public.discord.clientId,
  runtimeConfig.discordClientSecret,
  runtimeConfig.public.discord.redirectUri,
);

export const redisStateKey = (oauth: "discord", state: string) => `${oauth}-state-${state}`;
