export const RANK_QUERY_KEYS = {
  root: ["ranks"] as const,
  myRanks: () => [...RANK_QUERY_KEYS.root, "my"] as const,
  byOsuId: (osuId: number) => [...RANK_QUERY_KEYS.root, osuId] as const,
};

export const myRanksQuery = defineQueryOptions(() => ({
  key: RANK_QUERY_KEYS.myRanks(),
  query: () =>
    $fetch(`/api/users/me/ranks`, {
      headers: useRequestHeaders(["cookie"]),
    }),
}));
