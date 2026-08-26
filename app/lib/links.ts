import type { TournamentLink } from "~~/shared/validation/tournament-links";

export const typeIconMap: Record<TournamentLink["type"], string> = {
  "x/twitter": "fa7-brands:twitter",
  discord: "fa7-brands:discord",
  youtube: "fa7-brands:youtube",
  twitch: "fa7-brands:twitch",
  website: "fa7-solid:globe",
  forum_post: "simple-icons:osu",
  other: "fa7-solid:link",
  challonge: "fa7-solid:link",
};
