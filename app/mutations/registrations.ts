import { useRoute } from "vue-router";
import { toast } from "vue-sonner";

import { REGISTRATIONS_QUERY_KEYS } from "~/queries/registrations";

export const useTournamentRegistration = defineMutation(() => {
  const queryCache = useQueryCache();
  const slug = useRoute("tournaments-slug").params.slug;

  const { mutateAsync, ...mutation } = useMutation({
    mutation: () =>
      $fetch(`/api/tournaments/${slug}/registration`, {
        method: "POST",
        headers: useRequestHeaders(["cookie"]),
      }),
    onSuccess: () => {
      toast.success("You have successfully registered!");
      void queryCache.invalidateQueries({ key: REGISTRATIONS_QUERY_KEYS.bySlug(slug) });
    },
  });

  const { mutateAsync: revokeAsync, ...revokeMutation } = useMutation({
    mutation: () =>
      $fetch(`/api/tournaments/${slug}/registration`, {
        method: "DELETE",
        headers: useRequestHeaders(["cookie"]),
      }),
    onSuccess: () => {
      toast.success("Your registration has been revoked.");
      void queryCache.invalidateQueries({ key: REGISTRATIONS_QUERY_KEYS.bySlug(slug) });
    },
  });

  return {
    isRegistering: mutation.isLoading,
    soloRegister: () => mutateAsync(),
    isRevoking: revokeMutation.isLoading,
    revokeRegistration: () => revokeAsync(),
  };
});
