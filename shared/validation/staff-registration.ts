import type { InferEnum } from "drizzle-orm";
import * as v from "valibot";
import type { StaffRoles } from "~~/server/database/schema";

export const STAFF_ROLES = ["playtester", "referee", "commentator", "streamer"] satisfies InferEnum<
  typeof StaffRoles
>[];
export type StaffRole = (typeof STAFF_ROLES)[number];

export const staffRegistrationCreateSchema = v.object({
  roles: v.pipe(v.array(v.picklist(STAFF_ROLES)), v.minLength(1, "At least one role is required")),
  notes: v.string(),
});

export type StaffRegistrationCreate = v.InferOutput<typeof staffRegistrationCreateSchema>;

export const acceptStaffRegistrationSchema = v.object({
  roles: v.optional(
    v.pipe(
      v.array(v.picklist(STAFF_ROLES, "Invalid roles provided")),
      v.minLength(1, "At least one role is required"),
    ),
  ),
});
