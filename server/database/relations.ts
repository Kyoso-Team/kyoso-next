import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  tournaments: {
    tournamentDates: r.many.tournamentDates({
      from: r.tournaments.id,
      to: r.tournamentDates.tournamentId,
    }),
  },
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
      optional: false,
    }),
  },
  users: {
    discord: r.one.discordUsers({
      from: r.users.id,
      to: r.discordUsers.userId,
    }),
    country: r.one.countries({
      from: r.users.countryCode,
      to: r.countries.code,
      optional: false,
    }),
    badges: r.many.badges({
      from: r.users.id.through(r.userAwardedBadges.userId),
      to: r.badges.id.through(r.userAwardedBadges.badgeId),
    }),
  },
  userAwardedBadges: {
    badges: r.many.badges({
      from: r.userAwardedBadges.badgeId,
      to: r.badges.id,
    }),
  },
}));
