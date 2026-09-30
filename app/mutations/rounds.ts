import { useRoute } from "vue-router";
import { toast } from "vue-sonner";
import type { TournamentRoundUpdate } from "~~/shared/validation/tournament/rounds";

import { ROUNDS_QUERY_KEYS } from "~/queries/rounds";

export const useRounds = defineMutation(() => {
  const queryCache = useQueryCache();
  const route = useRoute("tournaments-slug");

  const invalidateRounds = () =>
    queryCache.invalidateQueries({ key: ROUNDS_QUERY_KEYS.bySlug(route.params.slug) });

  const { mutateAsync: createRoundAsync, ...createMutation } = useMutation({
    mutation: (input: TournamentRoundUpdate) =>
      $fetch(`/api/tournaments/${route.params.slug}/rounds`, {
        method: "POST",
        body: input,
        headers: useRequestHeaders(["cookie"]),
      }),
    onSuccess: () => {
      toast.success("Round created.");
      invalidateRounds();
    },
  });

  const { mutateAsync: updateRoundAsync, ...updateMutation } = useMutation({
    mutation: (input: { id: number; data: TournamentRoundUpdate }) =>
      $fetch(`/api/tournaments/${route.params.slug}/rounds/${input.id}`, {
        method: "PATCH",
        body: input.data,
        headers: useRequestHeaders(["cookie"]),
      }),
    onSuccess: () => {
      toast.success("Round updated.");
      invalidateRounds();
    },
  });

  const { mutateAsync: deleteRoundAsync, ...deleteMutation } = useMutation({
    mutation: (id: number) =>
      $fetch(`/api/tournaments/${route.params.slug}/rounds/${id}`, {
        method: "DELETE",
        headers: useRequestHeaders(["cookie"]),
      }),
    onSuccess: () => {
      toast.success("Round deleted.");
      invalidateRounds();
    },
  });

  return {
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    createRound: (data: TournamentRoundUpdate) => createRoundAsync(data),
    updateRound: (id: number, data: TournamentRoundUpdate) => updateRoundAsync({ id, data }),
    deleteRound: (id: number) => deleteRoundAsync(id),
  };
});
