import * as v from "valibot";
import { db } from "~~/server/database/client";
import { tournamentStaffApplications } from "~~/server/database/schema";
import { staffRegistrationCreateSchema } from "~~/shared/validation/staff-registration";

export default defineProtectedTournamentHandler(async (event, { session, tournament }) => {
  if (tournament.hostUserId === session.user.id) {
    throw createError({ statusCode: 403, message: "Host cannot apply for staff" });
  }

  const body = await readValidatedBody(event, (body) =>
    v.parse(staffRegistrationCreateSchema, body),
  );

  const existingApplication = await db.query.tournamentStaffApplications.findFirst({
    where: {
      tournamentId: tournament.id,
      userId: session.user.id,
    },
    columns: {
      id: true,
    },
  });

  if (existingApplication) {
    throw createError({ statusCode: 400, message: "Application already exists" });
  }

  await db.insert(tournamentStaffApplications).values({
    tournamentId: tournament.id,
    userId: session.user.id,
    ...body,
  });
});
