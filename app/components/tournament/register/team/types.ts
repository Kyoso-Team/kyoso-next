export type LookupStatus = "idle" | "loading" | "found" | "not-found" | "invalid";

export type OsuUserSummary = {
  osuId: number;
  username: string;
  countryCode: string;
  osuRank: number | null;
};

export type ResolvedOsuUser = OsuUserSummary & { avatarUrl: string };

export type TeamRegistrationCondition = {
  label: string;
  done: boolean;
  /** Optional conditions are displayed but never block submission. */
  optional?: boolean;
};
