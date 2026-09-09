import { db } from "~~/server/database/client";
import { getAssetUrl } from "~~/server/utils/s3";

export default defineProtectedTournamentHandler(async (_, { session, tournament }) => {
  const participation = await db.query.tournamentParticipants.findFirst({
    columns: {
      tournamentId: false,
      tournamentTeamId: false,
    },
    where: {
      tournamentId: tournament.id,
      userId: session.user.id,
    },
    with: {
      team: {
        columns: {
          id: true,
          avatar: true,
          name: true,
          captainUserId: true,
        },
      },
    },
  });

  return participation
    ? {
        ...participation,
        team: participation?.team
          ? {
              ...participation.team,
              avatar: participation.team.avatar
                ? getAssetUrl(participation.team.avatar.fileId)
                : null,
            }
          : null,
      }
    : null;
});
