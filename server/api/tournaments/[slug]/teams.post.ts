import * as v from "valibot";
import { db } from "~~/server/database/client";
import { tournamentParticipants } from "~~/server/database/schema";
import { tournamentTeams } from "~~/server/database/schema";
import { ensureUsers } from "~~/server/utils/osu/users";
import { tournamentTeamRegistrationCreateSchema } from "~~/shared/validation/tournament-registration";

export default defineProtectedTournamentHandler(async (event, { session, tournament }) => {
  if (tournament.type !== "teams") {
    throw createError({ statusCode: 400, message: "Cannot register teams" });
  }

  const schema = tournamentTeamRegistrationCreateSchema(tournament.minTeamSize!);

  const body = await readValidatedBody(event, (body) => v.parse(schema, body));

  await db.transaction(async (tx) => {
    const newTeam = await tx
      .insert(tournamentTeams)
      .values({
        name: body.name,
        tournamentId: tournament.id,
        captainUserId: session.user.id,
      })
      .returning({
        id: tournamentTeams.id,
      });

    const users = await ensureUsers(body.playerIds);

    const participants = users.map<typeof tournamentParticipants.$inferInsert>((user) => {
      return {
        userId: user.id,
        tournamentTeamId: newTeam[0]!.id,
        tournamentId: tournament.id,
        osuId: user.osuId,
        username: user.username,
        countryCode: user.countryCode,
      };
    });

    await tx.insert(tournamentParticipants).values(participants);
  });
});
