import { eq } from "drizzle-orm";
import * as v from "valibot";
import { db } from "~~/server/database/client";
import { tournamentAccess, tournamentStaffApplications } from "~~/server/database/schema";
import { acceptStaffRegistrationSchema } from "~~/shared/validation/staff-registration";

export default defineTournamentAccessHandler(async (event, { tournament }) => {
  const { id: staffApplicationId } = await getValidatedRouterParams(event, (params) =>
    v.parse(
      v.object({
        id: v.pipe(v.string(), v.toNumber()),
      }),
      params,
    ),
  );

  const body = await readValidatedBody(event, (body) =>
    v.parse(acceptStaffRegistrationSchema, body),
  );

  const application = await db.query.tournamentStaffApplications.findFirst({
    where: {
      id: staffApplicationId,
    },
    columns: {
      id: true,
      roles: true,
      userId: true,
    },
  });

  if (!application) {
    throw createError({ statusCode: 404, message: "Application not found" });
  }

  if (body.roles) {
    const providedRoles = new Set(body.roles);
    const availableRoles = new Set(application.roles);

    if (!availableRoles.isSupersetOf(providedRoles)) {
      throw createError({ statusCode: 400, message: "Invalid roles provided" });
    }
  }

  const roles = body.roles ?? application.roles;

  await db.transaction(async (tx) => {
    await tx.insert(tournamentAccess).values({
      userId: application.userId,
      roles,
      tournamentId: tournament.id,
    });

    await tx
      .delete(tournamentStaffApplications)
      .where(eq(tournamentStaffApplications.id, application.id));
  });
});
