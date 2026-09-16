import { db } from "~~/server/database/client";

export default defineProtectedTournamentHandler(async (_, { tournament }) => {
  const applications = await db.query.tournamentStaffApplications.findMany({
    where: {
      tournamentId: tournament.id,
    },
    columns: {
      id: true,
      roles: true,
      notes: true,
    },
    with: {
      user: {
        columns: {
          osuId: true,
          username: true,
          countryCode: true,
        },
        with: {
          discord: {
            columns: {
              username: true,
            },
          },
        },
      },
    },
  });

  return applications;
});
