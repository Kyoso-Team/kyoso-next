import type { TournamentRoundRow } from "~~/shared/validation/tournament/rounds";

export const ROUNDS_QUERY_KEYS = {
  root: ["rounds"] as const,
  bySlug: (slug: string) => [...ROUNDS_QUERY_KEYS.root, slug] as const,
};

export const roundsQuery = defineQueryOptions((data: { slug: string }) => ({
  key: ROUNDS_QUERY_KEYS.bySlug(data.slug),
  query: () =>
    $fetch<{ rounds: TournamentRoundRow[] }>(`/api/tournaments/${data.slug}/rounds`, {
      headers: useRequestHeaders(["cookie"]),
    }),
}));
