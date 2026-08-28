<script setup lang="ts">
import { myRanksQuery } from "~~/app/queries/rank";
import type { Tournament } from "~~/shared/validation/tournaments";

const { data: ranks } = useQuery(() => myRanksQuery());

const { tournament } = defineProps<{
  tournament: Tournament;
}>();

const inRankRange = computed(() => {
  if (tournament.isOpenRank) return true;

  if (!ranks.value) return false;
  const rank = ranks.value.osuRank ?? 0;

  return rank >= (tournament.upperRankLimit ?? 0) && rank <= (tournament.lowerRankLimit ?? 0);
});
</script>

<template>
  <div class="flex items-center justify-between">
    <span>
      Current rank:
      <span :class="{ 'text-red-400': !inRankRange }">#{{ ranks?.osuRank }}</span>
    </span>
    <Button class="h-5 text-xs" variant="outline">Refresh</Button>
  </div>
</template>
