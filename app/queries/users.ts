export const OSU_USERS_QUERY_KEYS = {
  root: ["users"] as const,
  lookup: () => [...OSU_USERS_QUERY_KEYS.root, "lookup"] as const,
  byOsuId: (osuId: number) => [...OSU_USERS_QUERY_KEYS.lookup(), osuId] as const,
};
