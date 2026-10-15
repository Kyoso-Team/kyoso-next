<script setup lang="ts">
import { useBeatmapStats, type StatOverrides } from "~/composables/use-beatmap-stats";
import type { MappoolSuggestions } from "~/queries/mappools";

const props = defineProps<{
  beatmap: MappoolSuggestions[number]["beatmap"];
  modBits: number;
  statOverrides?: StatOverrides;
}>();

const emit = defineEmits<{
  "update:statOverrides": [value: StatOverrides];
}>();

const localEdits = reactive<StatOverrides>({});

const { osuFile, stats } = useBeatmapStats(() => ({
  beatmap: props.beatmap,
  modBits: props.modBits,
  overrides: { ...props.statOverrides, ...localEdits },
}));

watch(
  () => [osuFile.value, props.statOverrides] as const,
  ([osu, overrides]) => {
    if (osu) {
      localEdits.cs = overrides?.cs ?? osu.cs;
      localEdits.ar = overrides?.ar ?? osu.ar;
      localEdits.od = overrides?.od ?? osu.od;
    }
  },
  { immediate: true },
);

const statRows = computed(() => {
  if (stats.value.status !== "ready") return [];

  const { cs, ar, od } = stats.value;
  return [
    { key: "cs", label: "CS", base: localEdits.cs, effective: cs, digits: 2 },
    { key: "ar", label: "AR", base: localEdits.ar, effective: ar, digits: 3 },
    { key: "od", label: "OD", base: localEdits.od, effective: od, digits: 3 },
  ] as const;
});

const formatStat = (stat: { base: number; effective: number; digits: number }) => {
  const base = stat.base.toPrecision(stat.digits);
  if (Math.round(stat.base) === Math.round(stat.effective)) return base;
  return `${base} → ${stat.effective.toPrecision(stat.digits)}`;
};

const setStat = (key: "cs" | "ar" | "od", value: number[]) => {
  localEdits[key] = Math.round(value[0]! * 10) / 10;
  commitOverrides();
};

const commitOverrides = () => {
  if (!osuFile.value) return;

  const out: StatOverrides = {};
  for (const key of ["cs", "ar", "od"] as const) {
    const committed = props.statOverrides?.[key] ?? osuFile.value[key];
    const current = localEdits[key];
    if (current !== undefined && Math.abs(current - committed) >= 1e-9) {
      out[key] = current;
    }
  }
  emit("update:statOverrides", out);
};
</script>

<template>
  <div v-if="stats.status === 'loading'">
    <Spinner />
  </div>
  <div v-else-if="stats.status === 'ready'" class="flex shrink-0 items-center">
    <!-- <Popover> -->
    <div class="flex flex-col gap-1">
      <div class="flex gap-2">
        <span>
          <strong>BPM:</strong>
          {{ stats.bpm.toFixed(1) }}
        </span>
        <span>
          <strong>Stars:</strong>
          {{ stats.stars.toFixed(2) }}★
        </span>
      </div>
      <div class="flex gap-2">
        <span v-for="stat in statRows" :key="stat.label">
          <span class="font-bold">{{ stat.label }}: </span>
          <span
            :class="{
              'text-red-500': localEdits[stat.key] !== stat.base,
            }"
            >{{ stat.effective.toPrecision(stat.digits) }}</span
          >
        </span>
      </div>
    </div>
    <!-- <PopoverTrigger>
        <Button variant="ghost" size="icon-sm">
          <Icon name="fa7-solid:gear" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" class="">
        <div class="flex flex-col gap-2 text-xs">
           <Button @click="localEdits = {}" variant="ghost" size="icon-xs">
            <Icon name="fa7-solid:arrow-left-rotate" />
          </Button>
          <div v-for="stat in statRows" :key="stat.label" class="flex flex-col gap-1">
            <span>{{ stat.label }}: {{ formatStat(stat) }}</span>
            <Slider
              :model-value="[stat.base]"
              :min="0"
              :max="10"
              :step="0.1"
              @update:model-value="(value) => setStat(stat.key, value)"
            />
            <span
              class="text-primary flex w-full items-center justify-between gap-1 px-2.5 text-xs font-medium"
              aria-hidden="true"
            >
              <span
                v-for="i in 11"
                :key="i"
                class="flex w-0 flex-col items-center justify-center gap-2"
              >
                <span>{{ i - 1 }}</span>
              </span>
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover> -->
  </div>
  <div v-else>
    <span class="font-bold">Calculation aborted</span>
  </div>
</template>
