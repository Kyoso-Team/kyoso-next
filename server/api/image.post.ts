import { eq } from "drizzle-orm";
import * as v from "valibot";

import { db } from "../database/client";
import { tournaments } from "../database/schema";

const schema = v.object({
  slug: v.string(),
  filename: v.string(),
  key: v.string(),
  assetType: v.picklist(["banner", "logo"]),
});

export default defineProtectedEventHandler(async (event, { session }) => {
  const { slug, filename, key, assetType } = await readValidatedBody(event, (body) =>
    v.parse(schema, body),
  );

  const tournament = await validateTournamentAccess(session, slug);

  await db
    .update(tournaments)
    .set({
      banner:
        assetType === "banner"
          ? {
              fileId: key,
              originalFileName: filename,
            }
          : undefined,
      logo:
        assetType === "logo"
          ? {
              fileId: key,
              originalFileName: filename,
            }
          : undefined,
    })
    .where(eq(tournaments.id, tournament.id));
});
