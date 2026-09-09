import { createSelectSchema } from "drizzle-orm/valibot";
import * as v from "valibot";
import { tournamentParticipants, tournamentTeams } from "~~/server/database/schema";

export const tournamentTeamRegistrationCreateSchema = (minPlayers: number) =>
  v.object({
    name: v.pipe(
      v.string(),
      v.minLength(2, "Team name must be at least 2 characters long."),
      v.maxLength(50, "Team name must be at most 50 characters long."),
    ),
    playerIds: v.pipe(
      v.array(v.number()),
      v.minLength(minPlayers, `A team needs at least ${minPlayers} players.`),
      v.check(
        (playerIds) => new Set(playerIds).size === playerIds.length,
        "Team must not have duplicate players.",
      ),
    ),
  });

export type TournamentTeamRegistrationCreate = v.InferOutput<
  ReturnType<typeof tournamentTeamRegistrationCreateSchema>
>;

const participantsSchema = createSelectSchema(tournamentParticipants, {
  createdAt: v.string(),
  updatedAt: v.string(),
});
const teamSchema = createSelectSchema(tournamentTeams, {
  avatar: v.nullable(v.pipe(v.string(), v.url())),
});

export const tournamentRegistrationSchema = v.object({
  ...v.omit(participantsSchema, ["tournamentId", "tournamentTeamId"]).entries,
  team: v.nullable(v.omit(teamSchema, ["tournamentId"])),
});

export type TournamentRegistration = v.InferOutput<typeof tournamentRegistrationSchema>;
