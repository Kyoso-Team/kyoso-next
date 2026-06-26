import { eq, and, or } from "drizzle-orm";
import { db } from "~~/server/database/client";
import { tournamentAccess, tournaments } from "~~/server/database/schema";

export default defineProtectedEventHandler(async (_, { session }) => {
  const res = await db
    .select({
      ...pick(tournaments, {
        id: true,
        name: true,
        slug: true,
        banner: true,
      }),
    })
    .from(tournaments)
    .leftJoin(
      tournamentAccess,
      and(
        eq(tournamentAccess.tournamentId, tournaments.id),
        eq(tournamentAccess.userId, session.user.id),
      ),
    )
    .where(
      or(eq(tournaments.hostUserId, session.user.id), eq(tournamentAccess.userId, session.user.id)),
    );

  return res.map((t) => ({ ...t, banner: t.banner ? getAssetUrl(t.banner.fileId) : null }));
});
