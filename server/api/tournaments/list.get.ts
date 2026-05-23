import { eq, and, or } from "drizzle-orm";
import { db } from "~~/server/database/client";
import { tournamentAccess, tournaments } from "~~/server/database/schema";

export default defineProtectedEventHandler(async (_, { session }) => {
  return await db
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
        eq(tournaments.id, tournamentAccess.tournamentId),
        or(
          eq(tournamentAccess.userId, session.user.osu.osuId),
          eq(tournaments.hostUserId, session.user.id),
        ),
      ),
    );
});
