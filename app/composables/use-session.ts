export function useSession() {
  return useFetch("/api/auth/session", {
    key: "session",
    headers: useRequestHeaders(["cookie"]),
  });
}
