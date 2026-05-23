import * as v from "valibot";

export const bwsValuesSchema = v.object({
  x: v.pipe(v.number(), v.notValue(0), v.minValue(-10), v.maxValue(10)),
  y: v.pipe(v.number(), v.notValue(0), v.minValue(-10), v.maxValue(10)),
  z: v.pipe(v.number(), v.notValue(0), v.minValue(-10), v.maxValue(10)),
});

export const teamSettingsSchema = v.object({
  minTeamSize: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(16)),
  maxTeamSize: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(16)),
  useTeamBanners: v.boolean(),
});

export type BWSValues = v.InferOutput<typeof bwsValuesSchema>;
export type TeamSettings = v.InferOutput<typeof teamSettingsSchema>;
