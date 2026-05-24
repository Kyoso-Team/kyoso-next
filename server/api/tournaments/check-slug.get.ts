import { eq } from "drizzle-orm";
import * as v from "valibot";
import { db } from "~~/server/database/client";
import { tournaments } from "~~/server/database/schema";

const schema = v.object({
  slug: v.string(),
});

export default defineProtectedEventHandler(async (event) => {
  const { slug } = await getValidatedQuery(event, (query) => v.parse(schema, query));

  const result = await db
    .select(pick(tournaments, { id: true }))
    .from(tournaments)
    .where(eq(tournaments.slug, slug))
    .limit(1)
    .then((res) => res[0]);

  return result !== undefined;
});
