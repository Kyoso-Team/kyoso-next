import { db } from "../database/client";
import type { badges } from "../database/schema";

type Badge = typeof badges.$inferSelect & { awardedAt: Date };

export default defineProtectedEventHandler(async (_, { session }) => {
  const result = await db.query.userAwardedBadges.findMany({
    where: {
      userId: session.user.id,
    },
    with: {
      badge: true,
    },
  });

  return result.reduce<Badge[]>((acc, curr) => {
    const badge = curr.badge;

    if (!badge) return acc;

    acc.push({
      ...badge,
      awardedAt: curr.awardedAt,
    });

    return acc;
  }, []);
});
