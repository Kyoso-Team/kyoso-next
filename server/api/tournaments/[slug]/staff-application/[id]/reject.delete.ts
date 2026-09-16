import { eq } from "drizzle-orm";
import * as v from "valibot";
import { db } from "~~/server/database/client";
import { tournamentStaffApplications } from "~~/server/database/schema";

export default defineTournamentAccessHandler(async (event) => {
  const { id: staffApplicationId } = await getValidatedRouterParams(event, (params) =>
    v.parse(
      v.object({
        id: v.pipe(v.string(), v.toNumber()),
      }),
      params,
    ),
  );

  await db
    .delete(tournamentStaffApplications)
    .where(eq(tournamentStaffApplications.id, staffApplicationId));
});
