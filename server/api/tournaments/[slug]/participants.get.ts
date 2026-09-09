import { EmptyFilter } from "drizzle-orm";
import { db } from "~~/server/database/client";
import type { TournamentSelect } from "~~/server/database/schema";
import { defineTournamentHandler } from "~~/server/utils/handlers/public/tournament.handler";
import { calculateBws, getEligibleBadges } from "~~/server/utils/osu/bws";
import type { Participant } from "~~/shared/types";

const getParticipants = (tournament: TournamentSelect) =>
  db.query.tournamentParticipants.findMany({
    where: {
      tournamentId: tournament.id,
      tournamentTeamId: tournament.type === "teams" ? { isNotNull: true } : EmptyFilter,
    },
    columns: {
      eligibleBadgesAmount: true,
      osuRank: true,
    },
    with: {
      team: {
        columns: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      participant: {
        columns: {
          id: true,
          username: true,
          countryCode: true,
          osuId: true,
        },
        with: {
          discord: {
            columns: {
              username: true,
            },
          },
          ranks: {
            columns: {
              osuRank: true,
            },
          },
          userAwardedBadges: {
            columns: {
              awardedAt: true,
            },
            with: {
              badge: {
                columns: {
                  id: true,
                  isBwsEligible: true,
                },
              },
            },
          },
        },
      },
    },
  });

type ParticipantRow = Awaited<ReturnType<typeof getParticipants>>[number];
type TeamRow = NonNullable<ParticipantRow["team"]>;

const toParticipant = (
  user: ParticipantRow,
  bwsSettings: TournamentSelect["bwsSettings"],
): Participant => {
  const badges = user.participant.userAwardedBadges.map(({ awardedAt, badge }) => ({
    ...badge,
    awardedAt,
  }));

  const badgeAmount = bwsSettings
    ? (user.eligibleBadgesAmount ?? getEligibleBadges(badges, bwsSettings.year).length)
    : 0;

  const baseRank = user.osuRank ?? user.participant.ranks.osuRank!;
  const rank = bwsSettings
    ? calculateBws({ rank: baseRank, badgeAmount, settings: bwsSettings })
    : baseRank;

  return {
    id: user.participant.id,
    osuId: user.participant.osuId,
    username: user.participant.username,
    countryCode: user.participant.countryCode,
    discord: user.participant.discord?.username ?? null,
    rank: Math.round(rank),
  };
};

export default defineTournamentHandler(async (_, { tournament }) => {
  const participants = await getParticipants(tournament);

  if (tournament.type !== "teams") {
    return {
      type: "solo" as const,
      participants: participants.map((user) => toParticipant(user, tournament.bwsSettings)),
    };
  }

  const teams = new Map<number, { team: TeamRow; participants: Participant[] }>();

  for (const user of participants) {
    if (!user.team) continue;

    const entry = teams.get(user.team.id) ?? { team: user.team, participants: [] };
    entry.participants.push(toParticipant(user, tournament.bwsSettings));
    teams.set(user.team.id, entry);
  }

  return {
    type: "teams" as const,
    data: [...teams.entries()].map(([id, { team, participants: members }]) => ({
      id,
      name: team.name,
      avatar: team.avatar,
      participants: members,
      rank: Math.round(members.reduce((sum, p) => sum + p.rank, 0) / members.length),
    })),
  };
});
