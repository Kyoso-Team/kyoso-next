import { db } from "~~/server/database/client";

export default defineProtectedEventHandler(async (_, { session }) => {
  return db.query.userRanks.findFirst({
    where: {
      userId: session.user.id,
    },
  });
});
