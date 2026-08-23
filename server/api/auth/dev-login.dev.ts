import { isProduction } from "std-env";
import { db } from "~~/server/database/client";
import { COOKIE_NAME } from "~~/shared/constants";

export default defineEventHandler(async (event) => {
  const user = await db.query.users.findFirst();

  const session = await createSession({
    id: user?.id ?? 1,
  });

  setCookie(event, COOKIE_NAME, session.token, {
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    maxAge: 60 * 60 * 24 * 30,
  });

  return await sendRedirect(event, "/", 302);
});
