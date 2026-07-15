import { getRules } from "~~/server/functions/get-rules";

export default defineTournamentAccessHandler(async (_event, { tournament }) => {
  return await getRules(tournament.slug);
});
