<script setup lang="ts">
import {
  formatLength,
  useBeatmapStats,
  type BeatmapStatsInput,
} from "~/composables/use-beatmap-stats";
import { almostEquals } from "~/lib/utils";

const props = defineProps<BeatmapStatsInput>();

const { osuFile, stats } = useBeatmapStats(props);

const statDiffs = computed(() => {
  const map = osuFile.value;
  const { overrides } = props;
  if (!map || !overrides) return { cs: false, ar: false, od: false };
  return {
    cs: overrides.cs !== undefined && !almostEquals(map.cs, overrides.cs),
    ar: overrides.ar !== undefined && !almostEquals(map.ar, overrides.ar),
    od: overrides.od !== undefined && !almostEquals(map.od, overrides.od),
  };
});
</script>

<template>
  <Spinner v-if="stats.status === 'loading'" class="col-span-full" />
  <span v-else-if="stats.status === 'suspicious'" class="col-span-full font-bold">
    Calculation aborted
  </span>
  <template v-else>
    <span>{{ stats.stars.toFixed(2) }}★</span>
    <span class="text-center">{{ stats.bpm.toFixed(1) }}</span>
    <span class="text-center">{{ formatLength(stats.length) }}</span>
    <span :class="{ 'font-bold': statDiffs.cs }">{{ stats.cs.toPrecision(2) }}</span>
    <span :class="{ 'font-bold': statDiffs.ar }">{{ stats.ar.toPrecision(3) }}</span>
    <span :class="{ 'font-bold': statDiffs.od }">{{ stats.od.toPrecision(3) }}</span>
  </template>
</template>
