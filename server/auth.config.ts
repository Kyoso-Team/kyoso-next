import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { defineServerAuth, type ServerAuthContext } from "@nuxtjs/better-auth/config";
import { customSession, genericOAuth } from "better-auth/plugins";
import type { BetterAuthOptions } from "better-auth/types";
import { inArray } from "drizzle-orm";
import { API, Ruleset } from "osu-api-v2-js";

import type { AuthUser } from "#nuxt-better-auth";

import { db } from "./database/client";
import { badges, userRanks, userAwardedBadges } from "./database/schema";
import { accounts, sessions, users, verifications } from "./database/schema";
import { osuClient } from "./osu-client";

const OSU_PROVIDER_ID = "osu";
const OSU_PROFILE_URL = "https://osu.ppy.sh/api/v2/me";

export const seedRanksAndBadges = async (user: Omit<AuthUser, "osuId" | "countryCode">) => {
  const osuUser = await db.query.users.findFirst({
    where: { id: Number(user.id) },
    columns: { id: true, osuId: true },
  });

  if (!osuUser) return;

  const osuUserData = await osuClient.getUser(osuUser.osuId, Ruleset.osu);

  await db.transaction(async (tx) => {
    await tx
      .insert(userRanks)
      .values({
        userId: Number(osuUser.id),
        osuRank: osuUserData.statistics.global_rank,
      })
      .onConflictDoUpdate({
        target: [userRanks.userId],
        set: {
          osuRank: osuUserData.statistics.global_rank,
        },
      });

    const badgesToInsert = osuUserData.badges.map<typeof badges.$inferInsert>((badge) => {
      const imgFileName = badge.image_url.split("/").at(-1) ?? "";

      return {
        imgFileName,
        description: badge.description,
        tournamentUrl: badge.url,
        isBwsEligible: !isNonTournamentBadge({
          description: badge.description,
          imgFileName,
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

    const awardedBadges: (typeof userAwardedBadges.$inferInsert)[] = osuUserData.badges.map(
      (badge) => ({
        awardedAt: new Date(badge.awarded_at),
        badgeId: dbBadges.find(
          ({ imgFileName }) => (badge.image_url.split("/").at(-1) || "") === imgFileName,
        )!.id,
        userId: Number(osuUser.id),
      }),
    );

    if (awardedBadges.length > 0) {
      await tx.insert(userAwardedBadges).values(awardedBadges).onConflictDoNothing();
    }
  });
};

const options = (ctx: ServerAuthContext) =>
  ({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: users,
        session: sessions,
        account: accounts,
        verification: verifications,
      },
    }),
    user: {
      fields: {
        name: "username",
      },
      additionalFields: {
        osuId: {
          type: "number",
          unique: true,
          required: true,
          returned: true,
          input: true,
        },
        countryCode: {
          type: "string",
          returned: true,
          input: true,
        },
      },
    },
    plugins: [
      genericOAuth({
        config: [
          {
            providerId: OSU_PROVIDER_ID,
            clientId: ctx.runtimeConfig.public.osu.clientId,
            redirectURI: ctx.runtimeConfig.public.osu.redirectUri,
            clientSecret: ctx.runtimeConfig.osuClientSecret,
            authorizationUrl: "https://osu.ppy.sh/oauth/authorize",
            tokenUrl: "https://osu.ppy.sh/oauth/token",
            userInfoUrl: OSU_PROFILE_URL,
            scopes: ["identify", "public"],
            getUserInfo: async (tokens) => {
              if (!tokens.accessToken) return null;

              const client = new API({
                access_token: tokens.accessToken,
                token_type: "Bearer",
              });

              const osuUser = await client.getResourceOwner();

              if (osuUser.is_bot || osuUser.is_deleted || osuUser.is_restricted) {
                return null;
              }

              return {
                id: osuUser.id,
                email: `${osuUser.id}@kyoso.invalid`,
                name: osuUser.username,
                image: osuUser.avatar_url,
                emailVerified: true,
                osuId: osuUser.id,
                countryCode: osuUser.country.code,
              };
            },
            mapProfileToUser: (profile) => ({
              osuId: profile.osuId as number,
              countryCode: profile.countryCode,
            }),
          },
        ],
      }),
    ],
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await seedRanksAndBadges(user);
          },
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
    },
    advanced: {
      database: {
        generateId: false,
      },
    },
  }) satisfies BetterAuthOptions;

export default defineServerAuth((ctx) => {
  const authOptions = options(ctx);

  return {
    ...authOptions,
    plugins: [
      ...authOptions.plugins,
      customSession(async ({ user, session }) => {
        const userData = await db.query.users.findFirst({
          where: {
            osuId: user.osuId,
          },
          columns: {},
          with: {
            country: true,
            discord: {
              columns: {
                username: true,
                discordId: true,
              },
            },
          },
        });

        return {
          session,
          user: {
            ...user,
            id: Number(user.id),
            country: userData?.country.name,
            discord: userData?.discord ?? null,
          },
        };
      }, authOptions),
    ],
  };
});
