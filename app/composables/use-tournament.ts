import type { Tournament } from "~~/shared/validation/tournaments";

export function useTournament(slug: string) {
  return useFetch<Tournament>(`/api/tournaments/${slug}`, {
    key: computed(() => `tournament-${slug}`),
  });
}
