import { inArray, sql } from "drizzle-orm";
import { Ruleset, type User } from "osu-api-v2-js";
import { db } from "~~/server/database/client";
import { badges, countries, users, userAwardedBadges, userRanks } from "~~/server/database/schema";
import { osuClient } from "~~/server/osu-client";
import { isNonTournamentBadge } from "~~/server/utils/badge";
import { pick } from "~~/server/utils/database";
import { chunk } from "~~/shared/utils/misc";

export const ensureUsers = async (osuIds: number[]) => {
  const existingUsers = await db.query.users.findMany({
    where: {
      osuId: {
        in: osuIds,
      },
    },
  });

  const existingOsuIds = new Set(existingUsers.map((user) => user.osuId));
  const remainingOsuIds = [...new Set(osuIds).difference(existingOsuIds)];

  if (remainingOsuIds.length === 0) return existingUsers;

  const apiUsers: User.Extended[] = [];

  for (const batch of chunk(remainingOsuIds, 10)) {
    const fetched = await Promise.all(
      batch.map((playerId) => osuClient.getUser(playerId, Ruleset.osu)),
    );
    apiUsers.push(...fetched);
  }

  const runtimeConfig = useRuntimeConfig();

  return await db.transaction(async (tx) => {
    const countryValues = [
      ...new Map(apiUsers.map((user) => [user.country.code, user.country])).values(),
    ];

    await tx
      .insert(countries)
      .values(countryValues)
      .onConflictDoUpdate({
        target: countries.code,
        set: {
          name: sql`excluded.name`,
        },
      });

    const userValues = apiUsers.map((user) => ({
      osuId: user.id,
      username: user.username,
      countryCode: user.country.code,
      isAdmin: Number(runtimeConfig.ownerOsuUserId) === user.id,
    }));

    const newUsers = await tx
      .insert(users)
      .values(userValues)
      .returning(pick(users, { id: true, osuId: true, username: true, countryCode: true }));

    const userIdByOsuId = new Map(newUsers.map((user) => [user.osuId, user.id]));

    await tx.insert(userRanks).values(
      apiUsers.map((user) => ({
        userId: userIdByOsuId.get(user.id)!,
        osuRank: user.statistics.global_rank,
      })),
    );

    const badgeByFileName = new Map(
      apiUsers
        .flatMap((user) => user.badges)
        .map((badge) => [badge.image_url.split("/").at(-1) ?? "", badge]),
    );

    if (badgeByFileName.size === 0) return newUsers;

    const newBadges = [...badgeByFileName].map(([imgFileName, badge]) => ({
      imgFileName,
      description: badge.description,
      tournamentUrl: badge.url,
      isBwsEligible: !isNonTournamentBadge({
        description: badge.description,
        imgFileName,
      }),
    }));

    await tx.insert(badges).values(newBadges).onConflictDoNothing();

    const dbBadges = await tx
      .select(pick(badges, { id: true, imgFileName: true }))
      .from(badges)
      .where(inArray(badges.imgFileName, [...badgeByFileName.keys()]));

    const badgeIdByFileName = new Map(dbBadges.map((badge) => [badge.imgFileName, badge.id]));

    const awardedBadges: (typeof userAwardedBadges.$inferInsert)[] = apiUsers.flatMap((user) =>
      user.badges.map((badge) => ({
        awardedAt: new Date(badge.awarded_at),
        badgeId: badgeIdByFileName.get(badge.image_url.split("/").at(-1) ?? "")!,
        userId: userIdByOsuId.get(user.id)!,
      })),
    );

    await tx.insert(userAwardedBadges).values(awardedBadges).onConflictDoNothing();

    return newUsers;
  });
};
