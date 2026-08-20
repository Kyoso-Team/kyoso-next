import type { Tournament } from "~~/shared/validation/tournaments";

export const DOCUMENT_QUERY_KEYS = {
  root: ["tournaments"] as const,
  bySlug: (slug: string) => [...DOCUMENT_QUERY_KEYS.root, slug] as const,
};

export const tournamentsQuery = defineQueryOptions(() => ({
  key: DOCUMENT_QUERY_KEYS.root,
  query: () =>
    $fetch(`/api/tournaments/list`, {
      headers: useRequestHeaders(["cookie"]),
    }),
}));

export const tournamentBySlugQuery = defineQueryOptions((data: { slug: string }) => ({
  key: DOCUMENT_QUERY_KEYS.bySlug(data.slug),
  query: () =>
    $fetch<Tournament>(`/api/tournaments/${data.slug}`, {
      headers: useRequestHeaders(["cookie"]),
    }),
}));
