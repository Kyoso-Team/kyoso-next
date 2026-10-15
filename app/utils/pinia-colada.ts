import { useMutationCache, type UseMutationEntryFilter } from "@pinia/colada";
import { computed, type ComputedRef } from "vue";

export function useIsMutating(filters?: UseMutationEntryFilter): ComputedRef<boolean> {
  const mutationCache = useMutationCache();

  return computed(() =>
    mutationCache.getEntries(filters).some((entry) => entry.asyncStatus.value === "loading"),
  );
}
