import { eq, inArray } from "drizzle-orm";
import { Ruleset } from "osu-api-v2-js";
import * as v from "valibot";
import { db } from "~~/server/database/client";
import { badges, countries, users, userAwardedBadges, userRanks } from "~~/server/database/schema";
import { osuClient } from "~~/server/osu-client";
import { isNonTournamentBadge } from "~~/server/utils/badge";
import { pick } from "~~/server/utils/database";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();

  const { userId } = await getValidatedQuery(event, (query) =>
    v.parse(v.object({ userId: v.pipe(v.string(), v.toNumber()) }), query),
  );

  const osuUser = await osuClient.getUser(userId, Ruleset.osu);

  const existingUser = await db
    .select(pick(users, { id: true }))
    .from(users)
    .where(eq(users.osuId, osuUser.id))
    .then((result) => result[0]);

  if (existingUser) {
    throw createError({
      status: 409,
      message: "User already exists",
    });
  }

  const result = await db.transaction(async (tx) => {
    const newCountry = await tx
      .insert(countries)
      .values({
        code: osuUser.country.code,
        name: osuUser.country.name,
      })
      .onConflictDoUpdate({
        target: countries.code,
        set: {
          name: osuUser.country.name,
        },
      })
      .returning(
        pick(countries, {
          code: true,
        }),
      )
      .then((result) => result[0]!);

    const newUser = await tx
      .insert(users)
      .values({
        osuId: osuUser.id,
        username: osuUser.username,
        countryCode: newCountry.code,
        isAdmin: Number(runtimeConfig.ownerOsuUserId) === osuUser.id,
      })
      .returning(pick(users, { id: true }))
      .then((result) => result[0]!);

    await tx.insert(userRanks).values({
      userId: newUser.id,
      osuRank: osuUser.statistics?.global_rank ?? null,
      taikoRank: null,
      maniaRank: null,
      fruitsRank: null,
    });

    const badgesToInsert = osuUser.badges.map<typeof badges.$inferInsert>((badge) => {
      return {
        imgFileName: badge.image_url.split("/").at(-1) ?? "",
        description: badge.description,
        tournamentUrl: badge.url,
        isBwsEligible: !isNonTournamentBadge({
          description: badge.description,
          imgFileName: badge.image_url.split("/").at(-1) ?? "",
        }),
      };
    });

    if (badgesToInsert.length > 0) {
      await tx.insert(badges).values(badgesToInsert).onConflictDoNothing();
    }

    const dbBadges =
      badgesToInsert.length > 0
        ? await tx
            .select(pick(badges, { id: true, imgFileName: true }))
            .from(badges)
            .where(
              inArray(
                badges.imgFileName,
                badgesToInsert.map((b) => b.imgFileName),
              ),
            )
        : [];

    const awardedBadges: (typeof userAwardedBadges.$inferInsert)[] = osuUser.badges.map(
      (badge) => ({
        awardedAt: new Date(badge.awarded_at),
        badgeId: dbBadges.find(
          ({ imgFileName }) => (badge.image_url.split("/").at(-1) || "") === imgFileName,
        )!.id,
        userId: newUser.id,
      }),
    );

    if (awardedBadges.length > 0) {
      await tx.insert(userAwardedBadges).values(awardedBadges).onConflictDoNothing();
    }

    return newUser;
  });

  return {
    id: result.id,
  };
});
