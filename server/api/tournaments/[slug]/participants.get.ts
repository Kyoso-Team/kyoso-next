import { db } from "~~/server/database/client";
import { defineTournamentHandler } from "~~/server/utils/handlers/public/tournament.handler";
import { calculateBws, getEligibleBadges } from "~~/server/utils/osu/bws";

const getSoloParticipants = async (tournamentId: number) => {
  return await db.query.tournamentParticipants.findMany({
    where: {
      tournamentId,
    },
    columns: {
      eligibleBadgesAmount: true,
      osuRank: true,
      snapshotAt: true,
    },
    with: {
      participant: {
        columns: {
          id: true,
          username: true,
          countryCode: true,
          osuId: true,
        },
        with: {
          discord: true,
          ranks: true,
          userAwardedBadges: {
            columns: {
              awardedAt: true,
            },
            with: {
              badge: true,
            },
          },
        },
      },
    },
  });
};

export default defineTournamentHandler(async (_, { tournament }) => {
  const bwsSettings = tournament.bwsSettings;
  const shouldCalculateBws = !!bwsSettings;

  // if (tournament.type !== "teams") {
  const participants = await getSoloParticipants(tournament.id);

  return participants.map((user) => {
    const badges = user.participant.userAwardedBadges.map(({ awardedAt, badge }) => ({
      ...badge,
      awardedAt,
    }));

    const badgeAmount = shouldCalculateBws
      ? (user.eligibleBadgesAmount ?? getEligibleBadges(badges, bwsSettings.year).length)
      : 0;

    const rank = shouldCalculateBws
      ? calculateBws({
          rank: user.osuRank ?? user.participant.ranks.osuRank!,
          badgeAmount,
          settings: bwsSettings,
        })
      : user.participant.ranks.osuRank!;

    return {
      ...user.participant,
      discord: user.participant.discord?.username,
      rank: Math.round(rank),
    };
  });
  // }

  // const participants = await db.query.tournamentParticipants.findMany({
  //   where: {
  //     tournamentId: tournament.id,
  //   },
  //   with: {
  //     participant: {
  //       with: {
  //         ranks: true,
  //         badges: true,
  //       },
  //     },
  //   },
  // });

  // return participants;
});
