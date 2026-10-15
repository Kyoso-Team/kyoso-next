<script setup lang="ts">
import { formatLength, type BeatmapStatsInput } from "~/composables/use-beatmap-stats";

const props = defineProps<BeatmapStatsInput>();

const { stats } = useBeatmapStats(props);
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
    <span>{{ stats.cs.toPrecision(2) }}</span>
    <span>{{ stats.ar.toPrecision(3) }}</span>
    <span>{{ stats.od.toPrecision(3) }}</span>
  </template>
</template>
