export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === "development") {
    return;
  }

  if (event.method === "GET" || event.method === "HEAD") {
    return;
  }

  const origin = getHeader(event, "origin");

  if (origin === "kyoso.com") {
    return;
  }

  throw createError({
    statusCode: 419,
  });
});
