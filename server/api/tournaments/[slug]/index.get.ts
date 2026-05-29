import { defineTournamentAccessHandler } from "~~/server/utils/handlers/tournament-access.handler";

export default defineTournamentAccessHandler(async (_event, { tournament }) => {
  return tournament;
});
