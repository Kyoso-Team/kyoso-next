import { db } from "~~/server/database/client";
import { defineTournamentAccessHandler } from "~~/server/utils/handlers/tournament-access.handler";
import { getAssetUrl } from "~~/server/utils/s3";

export default defineTournamentAccessHandler(async (_event, { tournament }) => {
  const result = await db.query.tournaments.findFirst({
    where: {
      id: tournament.id,
    },
    columns: {
      id: true,
      slug: true,
      name: true,
      acronym: true,
      type: true,
      minTeamSize: true,
      maxTeamSize: true,
      lowerRankLimit: true,
      upperRankLimit: true,
      isOpenRank: true,
      bwsSettings: true,
      playerRegistrationStart: true,
      playerRegistrationEnd: true,
      staffRegistrationStart: true,
      staffRegistrationEnd: true,
      banner: true,
      logo: true,
    },
    with: {
      tournamentDates: {
        columns: {
          id: true,
          label: true,
          startDate: true,
          endDate: true,
          type: true,
        },
        orderBy: {
          startDate: "asc",
        },
      },
    },
  });

  if (!result) {
    // this will never throw since we check for existence inside handler
    throw createError({ statusCode: 404, message: "Tournament not found" });
  }

  const dates = {
    dates: result.tournamentDates,
    playerRegs: {
      start: result.playerRegistrationStart,
      end: result.playerRegistrationEnd,
    },
    staffRegs: {
      start: result.staffRegistrationStart,
      end: result.staffRegistrationEnd,
    },
  };

  const rest = omit(result, [
    "playerRegistrationStart",
    "playerRegistrationEnd",
    "staffRegistrationStart",
    "staffRegistrationEnd",
  ]);

  return {
    ...rest,
    logo: result!.logo ? getAssetUrl(result!.logo.fileId) : null,
    banner: result!.banner ? getAssetUrl(result!.banner.fileId) : null,
    tournamentDates: dates,
  };
});
