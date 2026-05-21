import { getCookieSession } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  return await getCookieSession(event);
});
