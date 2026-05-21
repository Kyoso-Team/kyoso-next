import { API } from "osu-api-v2-js";

const runtimeConfig = useRuntimeConfig();

export const osuClient = new API({
  client_id: Number(runtimeConfig.public.osu.clientId),
  client_secret: runtimeConfig.osuClientSecret,
});
