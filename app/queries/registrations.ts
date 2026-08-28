export const REGISTRATIONS_QUERY_KEYS = {
  root: ["registrations"] as const,
  bySlug: (slug: string) => [...REGISTRATIONS_QUERY_KEYS.root, slug] as const,
};
