import { $fetch } from "#build/fetch";

export const MAPPOOLS_QUERY_KEYS = {
  root: ["mappools"] as const,
  bySlug: (slug: string) => [...MAPPOOLS_QUERY_KEYS.root, slug] as const,
  suggestions: (slug: string) => [...MAPPOOLS_QUERY_KEYS.bySlug(slug), "suggestions"] as const,
  suggestionsByRound: (slug: string, roundId: number) =>
    [...MAPPOOLS_QUERY_KEYS.suggestions(slug), "round", roundId] as const,
};

export const mapppoolSuggestionsQuery = defineQueryOptions(
  (data: { slug: string; roundId: number }) => ({
    key: MAPPOOLS_QUERY_KEYS.suggestionsByRound(data.slug, data.roundId),
    query: () =>
      $fetch(`/api/tournaments/${data.slug}/mappools/suggestions`, {
        method: "GET",
        query: {
          roundId: data.roundId,
        },
        headers: useRequestHeaders(["cookie"]),
      }),
    placeholderData: (prev) => prev,
  }),
);

export type MappoolSuggestions = Awaited<
  ReturnType<ReturnType<typeof mapppoolSuggestionsQuery>["query"]>
>;
