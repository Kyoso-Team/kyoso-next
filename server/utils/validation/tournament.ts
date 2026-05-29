import * as v from "valibot";

export const bwsSettingsSchema = v.pipe(
  v.object({
    x: v.pipe(v.number(), v.minValue(0.01), v.maxValue(1)),
    y: v.pipe(v.number(), v.notValue(0), v.minValue(-10), v.maxValue(10)),
    z: v.pipe(v.number(), v.notValue(0), v.minValue(-10), v.maxValue(10)),
    /**
     * Type of BWS formula to use
     * - `linear`: rank^(x)^ (badges^(y));
     * - `quadratic`: rank^(x)^((badges*(badges+y))/z);
     */
    type: v.picklist(["linear", "quadratic"]),
    /** BWS formula will only count badges from that year onwards */
    year: v.nullable(v.pipe(v.number(), v.minValue(2000), v.maxValue(2100))),
  }),
  v.check((input) => {
    if (input.type === "linear") {
      return input.z === 1;
    }
    return true;
  }, "Invalid BWS formula parameters"),
);

export const teamSettingsSchema = v.object({
  minTeamSize: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(16)),
  maxTeamSize: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(16)),
  useTeamBanners: v.boolean(),
});

export type BWSSettings = v.InferOutput<typeof bwsSettingsSchema>;
export type TeamSettings = v.InferOutput<typeof teamSettingsSchema>;
