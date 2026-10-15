/**
 * Extracts the human-readable message from an ofetch `FetchError`.
 *
 * ofetch builds `error.message` itself (`[POST] "/path": 400 Bad Request`),
 * so the message returned by the server lives in the response body instead:
 * `error.data.message`.
 */
export const apiErrorMessage = (error: unknown, fallback = "Something went wrong"): string => {
  const message = (error as { data?: { message?: unknown } } | null)?.data?.message;
  return typeof message === "string" ? message : fallback;
};
