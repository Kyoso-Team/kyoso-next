import type { Tournament } from "~~/shared/validation/tournaments";

import type { TeamRegistrationCondition } from "./types";

export type TeamConditionState = {
  isNameSet: boolean;
  resolvedCount: number;
  isUnique: boolean;
  hasAvatar: boolean;
};

export const buildTeamRegistrationConditions = (
  tournament: Tournament | null | undefined,
  state: TeamConditionState,
): TeamRegistrationCondition[] => {
  if (!tournament) return [];

  return [
    { label: "Team name set", done: state.isNameSet },
    {
      label: `At least ${tournament.minTeamSize ?? 0} players resolved`,
      done: state.resolvedCount >= (tournament.minTeamSize ?? 0),
    },
    { label: "No duplicate players", done: state.isUnique },
    { label: "Team avatar (optional)", done: state.hasAvatar, optional: true },
  ];
};
