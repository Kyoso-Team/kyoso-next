import type { Tournament } from "~~/shared/validation/tournaments";

export const TOURNAMENT_QUERY_KEYS = {
  root: ["tournaments"] as const,
  bySlug: (slug: string) => [...TOURNAMENT_QUERY_KEYS.root, slug] as const,
};

export const tournamentsQuery = defineQueryOptions(() => ({
  key: TOURNAMENT_QUERY_KEYS.root,
  query: () =>
    $fetch(`/api/tournaments/list`, {
      headers: useRequestHeaders(["cookie"]),
    }),
}));

export const tournamentBySlugQuery = defineQueryOptions((data: { slug: string }) => ({
  key: TOURNAMENT_QUERY_KEYS.bySlug(data.slug),
  query: () =>
    $fetch<Tournament>(`/api/tournaments/${data.slug}`, {
      headers: useRequestHeaders(["cookie"]),
    }),
}));
