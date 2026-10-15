import type { Mod } from "osu-web.js";

export const APPLIABLE_OSU_MODS: (Mod | "NM" | (string & {}))[] = [
  "NM",
  "HD",
  "HR",
  "DT",
  "EZ",
  "HT",
  "FL",
];

export const isOsuMod = (mod: string): mod is Mod => {
  return APPLIABLE_OSU_MODS.includes(mod);
};
