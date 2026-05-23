import * as v from "valibot";

export const oauthCallbackQuerySchema = v.object({
  code: v.string(),
  state: v.string(),
});
