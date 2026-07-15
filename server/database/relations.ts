import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  tournaments: {
    tournamentDates: r.many.tournamentDates({
      from: r.tournaments.id,
      to: r.tournamentDates.tournamentId,
    }),
  },
}));
