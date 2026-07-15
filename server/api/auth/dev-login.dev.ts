import { isProduction } from "std-env";
import { COOKIE_NAME } from "~~/shared/constants";

export default defineEventHandler(async (event) => {
  const session = await createSession({
    id: 3,
  });

  setCookie(event, COOKIE_NAME, session.token, {
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    maxAge: 60 * 60 * 24 * 30,
  });

  return await sendRedirect(event, "/", 302);
});
