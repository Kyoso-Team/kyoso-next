import { useRoute } from "vue-router";
import { toast } from "vue-sonner";
import type { TournamentTeamRegistrationCreate } from "~~/shared/validation/tournament-registration";

import { REGISTRATIONS_QUERY_KEYS } from "~/queries/registrations";

export const useTournamentRegistration = defineMutation(() => {
  const queryCache = useQueryCache();
  const route = useRoute("tournaments-slug");

  const { mutateAsync, ...mutation } = useMutation({
    mutation: () =>
      $fetch(`/api/tournaments/${route.params.slug}/registration`, {
        method: "POST",
        headers: useRequestHeaders(["cookie"]),
      }),
    onSuccess: () => {
      toast.success("You have successfully registered!");
      queryCache.invalidateQueries({ key: REGISTRATIONS_QUERY_KEYS.bySlug(route.params.slug) });
    },
  });

  const { mutateAsync: teamMutateAsync, ...teamMutation } = useMutation({
    mutation: (input: TournamentTeamRegistrationCreate) =>
      $fetch(`/api/tournaments/${route.params.slug}/teams`, {
        method: "POST",
        body: input,
        headers: useRequestHeaders(["cookie"]),
      }),
    onSuccess: () => {
      toast.success("Your team has been registered!");
      queryCache.invalidateQueries({ key: REGISTRATIONS_QUERY_KEYS.bySlug(route.params.slug) });
    },
    onError: () => {
      toast.error("Failed to register your team");
    },
  });

  const { mutateAsync: revoke, ...revokeMutation } = useMutation({
    mutation: () =>
      $fetch(`/api/tournaments/${route.params.slug}/registration`, {
        method: "DELETE",
        headers: useRequestHeaders(["cookie"]),
      }),
    onSuccess: () => {
      toast.success("Your registration has been revoked.");
      queryCache.invalidateQueries({ key: REGISTRATIONS_QUERY_KEYS.bySlug(route.params.slug) });
    },
  });

  return {
    isRegistering: mutation.isLoading,
    soloRegister: () => mutateAsync(),
    isTeamRegistering: teamMutation.isLoading,
    teamRegister: (input: TournamentTeamRegistrationCreate) => teamMutateAsync(input),
    isRevoking: revokeMutation.isLoading,
    revokeRegistration: () => revoke(),
  };
});
