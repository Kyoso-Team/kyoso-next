import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  tournaments: {
    tournamentDates: r.many.tournamentDates({
      from: r.tournaments.id,
      to: r.tournamentDates.tournamentId,
    }),
    staff: r.many.users({
      from: r.tournaments.id.through(r.tournamentAccess.tournamentId),
      to: r.users.id.through(r.tournamentAccess.userId),
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
    userAwardedBadges: r.many.userAwardedBadges({
      from: r.users.id,
      to: r.userAwardedBadges.userId,
    }),
    ranks: r.one.userRanks({
      from: r.users.id,
      to: r.userRanks.userId,
      optional: false,
    }),
  },
  userAwardedBadges: {
    badge: r.one.badges({
      from: r.userAwardedBadges.badgeId,
      to: r.badges.id,
      optional: false,
    }),
  },
  tournamentParticipants: {
    participant: r.one.users({
      from: r.tournamentParticipants.userId,
      to: r.users.id,
      optional: false,
    }),
  },
}));
