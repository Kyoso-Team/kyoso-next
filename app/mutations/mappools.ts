import { defineMutationOptions } from "@pinia/colada";
import type { UpdateMappoolEntry } from "~~/shared/validation/tournament/mappools";

import { $fetch } from "#build/fetch";
import { MAPPOOLS_QUERY_KEYS, type MappoolSuggestions } from "~/queries/mappools";

export type AddMappoolSuggestionInput = {
  beatmapId: number;
  roundId: number;
  slot?: string;
  position?: number;
};

export const addMappoolSuggestionMutation = defineMutationOptions(() => {
  const queryCache = useQueryCache();
  const route = useRoute("tournaments-slug");

  return {
    mutation: (input: AddMappoolSuggestionInput) =>
      $fetch(`/api/tournaments/${route.params.slug}/mappools/suggestions`, {
        method: "POST",
        body: input,
      }),
    onSuccess: async (_, input) => {
      await queryCache.invalidateQueries({
        key: MAPPOOLS_QUERY_KEYS.suggestionsByRound(route.params.slug, input.roundId),
      });
    },
  };
});

export const useUpdateMappoolSuggestion = defineMutation(() => {
  const queryCache = useQueryCache();
  const route = useRoute("tournaments-slug");

  const { mutate } = useMutation({
    mutation: (input: { roundId: number; suggestionId: number; body: UpdateMappoolEntry }) =>
      $fetch(`/api/tournaments/${route.params.slug}/mappools/suggestions/${input.suggestionId}`, {
        method: "PATCH",
        body: input.body,
      }),
    onSuccess: async (data, input) => {
      if (data.affectedIds.length > 1) {
        void queryCache.invalidateQueries({
          key: MAPPOOLS_QUERY_KEYS.suggestionsByRound(route.params.slug, input.roundId),
        });
      } else {
        queryCache.setQueryData(
          MAPPOOLS_QUERY_KEYS.suggestionsByRound(route.params.slug, input.roundId),
          (entries: MappoolSuggestions | undefined) =>
            entries?.map((entry) => {
              if (entry.id !== input.suggestionId) return entry;
              return { ...entry, ...data.entry };
            }),
        );
      }
    },
  });

  return {
    update: (input: { roundId: number; suggestionId: number; body: UpdateMappoolEntry }) =>
      mutate(input),
  };
});

export const useRemoveMappoolSuggestion = defineMutation(() => {
  const queryCache = useQueryCache();
  const route = useRoute("tournaments-slug");

  const { mutate } = useMutation({
    mutation: (input: { suggestionId: number; roundId: number }) =>
      $fetch(`/api/tournaments/${route.params.slug}/mappools/suggestions/${input.suggestionId}`, {
        method: "DELETE",
      }),
    onSuccess: async (_, input) => {
      await queryCache.invalidateQueries({
        key: MAPPOOLS_QUERY_KEYS.suggestionsByRound(route.params.slug, input.roundId),
      });
    },
  });

  return {
    remove: mutate,
  };
});
