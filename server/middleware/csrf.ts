export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === "development") {
    return;
  }

  if (event.method === "GET" || event.method === "HEAD") {
    return;
  }

  const secFetchSiteHeader = getHeader(event, "Sec-Fetch-Site");

  if (secFetchSiteHeader && secFetchSiteHeader !== "same-origin") {
    return;
  }

  throw createError({
    statusCode: 403,
  });
});
