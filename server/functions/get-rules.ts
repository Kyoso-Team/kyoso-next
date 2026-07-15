import { eq } from "drizzle-orm";

import { db } from "../database/client";
import { tournaments } from "../database/schema";

export const getRules = defineCachedFunction(
  async (slug: string) => {
    const rules = await db
      .select(
        pick(tournaments, {
          rules: true,
        }),
      )
      .from(tournaments)
      .where(eq(tournaments.slug, slug))
      .limit(1)
      .then(([rules]) => rules);

    return rules?.rules;
  },
  {
    maxAge: 60 * 60 * 24,
    name: "rules",
    getKey: (slug: string) => `${slug}-rules`,
  },
);
