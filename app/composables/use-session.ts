export const useSession = defineQuery(() => {
  return useQuery({
    key: () => ["session"],
    query: () =>
      $fetch("/api/auth/session", {
        headers: useRequestHeaders(["cookie"]),
      }),
  });
});
