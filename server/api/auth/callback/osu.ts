import { eq, inArray, sql } from "drizzle-orm";
import { API } from "osu-api-v2-js";
import { isProduction } from "std-env";
import * as v from "valibot";
import { db } from "~~/server/database/client";
import { badges, countries, users, userAwardedBadges, userRanks } from "~~/server/database/schema";
import { pick } from "~~/server/utils/database";
import { redisStateKey } from "~~/server/utils/oauth";
import { oauthCallbackQuerySchema } from "~~/server/utils/validation/common";
import { COOKIE_NAME } from "~~/shared/constants";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();

  const { code, state } = await getValidatedQuery(event, (query) => {
    const parse = v.safeParse(oauthCallbackQuerySchema, query);

    if (!parse.success) {
      return sendRedirect(event, "/login");
    }

    return parse.output;
  });

  const stateKey = redisStateKey("osu", state);

  const isValidState = await useStorage("redis").getItem(stateKey);

  if (!isValidState) {
    throw createError({
      status: 401,
      message: "Invalid state",
    });
  }

  await useStorage("redis").removeItem(stateKey);

  const client = new API(
    Number(runtimeConfig.public.osu.clientId),
    runtimeConfig.osuClientSecret,
    runtimeConfig.public.osu.redirectUri,
    code,
  );

  const osuUser = await client.getResourceOwner().catch((e) => {
    console.error(e);
    throw createError({
      status: 401,
      message: "Failed to get resource owner",
    });
  });

  if (osuUser.is_bot || osuUser.is_deleted || osuUser.is_restricted) {
    throw createError({
      status: 401,
    });
  }

  const existingUser = await db
    .update(users)
    .set({
      username: osuUser.username,
      countryCode: osuUser.country_code,
    })
    .where(eq(users.osuId, osuUser.id))
    .returning({
      ...pick(users, {
        id: true,
      }),
      exists: sql<boolean>`1`.as("exists"),
    })
    .then((user) => user[0]);

  if (existingUser?.exists) {
    await db
      .insert(userRanks)
      .values({
        userId: existingUser.id,
        osuRank: osuUser.statistics_rulesets.osu?.global_rank,
        taikoRank: osuUser.statistics_rulesets.taiko?.global_rank,
        maniaRank: osuUser.statistics_rulesets.mania?.global_rank,
        fruitsRank: osuUser.statistics_rulesets.fruits?.global_rank,
      })
      .onConflictDoUpdate({
        target: [userRanks.userId],
        set: {
          osuRank: osuUser.statistics_rulesets.osu?.global_rank,
          taikoRank: osuUser.statistics_rulesets.taiko?.global_rank,
          maniaRank: osuUser.statistics_rulesets.mania?.global_rank,
          fruitsRank: osuUser.statistics_rulesets.fruits?.global_rank,
        },
      });

    const session = await createSession({
      id: existingUser.id,
    });

    setCookie(event, COOKIE_NAME, session.token, {
      path: "/",
      sameSite: "lax",
      secure: isProduction,
      maxAge: 60 * 60 * 24 * 30,
    });

    return await sendRedirect(event, "/", 302);
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

    await tx
      .insert(userRanks)
      .values({
        userId: newUser.id,
        osuRank: osuUser.statistics_rulesets.osu?.global_rank,
        taikoRank: osuUser.statistics_rulesets.taiko?.global_rank,
        maniaRank: osuUser.statistics_rulesets.mania?.global_rank,
        fruitsRank: osuUser.statistics_rulesets.fruits?.global_rank,
      })
      .onConflictDoUpdate({
        target: [userRanks.userId],
        set: {
          osuRank: osuUser.statistics_rulesets.osu?.global_rank,
          taikoRank: osuUser.statistics_rulesets.taiko?.global_rank,
          maniaRank: osuUser.statistics_rulesets.mania?.global_rank,
          fruitsRank: osuUser.statistics_rulesets.fruits?.global_rank,
        },
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

  const session = await createSession({
    id: result.id,
  });

  setCookie(event, COOKIE_NAME, session.token, {
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    maxAge: 60 * 60 * 24 * 30,
  });
  return await sendRedirect(event, "/", 302);
});
