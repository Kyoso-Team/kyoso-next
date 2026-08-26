import * as v from "valibot";

export const TOURNAMENT_LINK_TYPES = [
  "website",
  "forum_post",
  "twitch",
  "discord",
  "x/twitter",
  "youtube",
  "challonge",
  "other",
] as const;

export type TournamentLinkType = (typeof TOURNAMENT_LINK_TYPES)[number];

export const tournamentLinkItemSchema = v.object({
  label: v.pipe(v.string(), v.minLength(2, "Label must be at least 2 characters long")),
  url: v.pipe(v.string(), v.url("Invalid URL")),
  type: v.picklist(TOURNAMENT_LINK_TYPES),
});

export const tournamentLinkSchema = v.object({
  links: v.array(tournamentLinkItemSchema),
});
export type TournamentLink = v.InferOutput<typeof tournamentLinkItemSchema>;
