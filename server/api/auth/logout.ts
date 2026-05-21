import { COOKIE_NAME } from "~~/shared/constants";

export default defineProtectedEventHandler(async (event) => {
  const sessionCookie = getCookie(event, COOKIE_NAME);

  if (!sessionCookie) {
    throw createError({
      statusCode: 401,
      message: "No session found",
    });
  }

  await invalidateSession(sessionCookie);
  deleteCookie(event, COOKIE_NAME, { path: "/" });

  await sendRedirect(event, "/login", 302);
});
