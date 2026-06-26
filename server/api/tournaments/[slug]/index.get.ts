import { defineTournamentAccessHandler } from "~~/server/utils/handlers/tournament-access.handler";
import { getAssetUrl } from "~~/server/utils/s3";

export default defineTournamentAccessHandler(async (_event, { tournament }) => {
  return {
    ...tournament,
    logo: tournament.logo ? getAssetUrl(tournament.logo.fileId) : null,
    banner: tournament.banner ? getAssetUrl(tournament.banner.fileId) : null,
  };
});
