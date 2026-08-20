import { db } from "../database/client";

export const getRules = defineCachedFunction(
  async (slug: string) => {
    const rules = await db.query.tournaments.findFirst({
      columns: {
        rules: true,
      },
      where: {
        slug,
      },
    });

    return rules?.rules;
  },
  {
    maxAge: 60 * 60 * 24,
    name: "rules",
    getKey: (slug: string) => `${slug}-rules`,
  },
);
