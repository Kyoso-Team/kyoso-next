import { Discord, Osu } from "arctic";

const runtimeConfig = useRuntimeConfig();

export const osuOAuth = new Osu(
  runtimeConfig.public.osu.clientId,
  runtimeConfig.osuClientSecret,
  runtimeConfig.public.osu.redirectUri,
);

export const discordOAuth = new Discord(
  runtimeConfig.public.discord.clientId,
  runtimeConfig.discordClientSecret,
  runtimeConfig.public.discord.redirectUri,
);

export const redisStateKey = (oauth: "osu" | "discord", state: string) => `${oauth}-state-${state}`;
