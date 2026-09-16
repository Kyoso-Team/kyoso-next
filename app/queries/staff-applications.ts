export const STAFF_APPLICATION_QUERY_KEYS = {
  root: ["staff-applications"] as const,
  bySlug: (slug: string) => [...STAFF_APPLICATION_QUERY_KEYS.root, slug] as const,
};

export const staffApplicationQuery = defineQueryOptions((data: { slug: string }) => ({
  key: STAFF_APPLICATION_QUERY_KEYS.bySlug(data.slug),
  query: () =>
    $fetch(`/api/tournaments/${data.slug}/staff-application`, {
      headers: useRequestHeaders(["cookie"]),
    }),
}));
