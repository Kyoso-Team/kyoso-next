<script setup lang="ts">
import { diff } from "ohash/utils";
import { ModsEnum } from "osu-web.js";

import { useBeatmapStats, type StatOverrides } from "~/composables/use-beatmap-stats";
import { almostEquals } from "~/lib/utils";
import type { MappoolSuggestions } from "~/queries/mappools";

const props = defineProps<{
  beatmap: MappoolSuggestions[number]["beatmap"];
  modBits: number;
  statOverrides?: StatOverrides;
}>();

const emit = defineEmits<{
  "update:statOverrides": [value: StatOverrides];
}>();

const modBits = toRef(() => props.modBits);
const allowedDiffAdjust = computed(() => !(modBits.value & (ModsEnum.HR | ModsEnum.EZ)));

const clockRateDefault = computed(() => {
  if (modBits.value & ModsEnum.DT) return 1.5;
  if (modBits.value & ModsEnum.HT) return 0.75;
  return undefined;
});
const allowedClockRateAdjust = computed(() => clockRateDefault.value !== undefined);
const clockRateBounds = computed(() =>
  modBits.value & ModsEnum.DT ? { min: 1.01, max: 2 } : { min: 0.5, max: 0.99 },
);

const localEdits = reactive<StatOverrides>({});

const { osuFile, stats } = useBeatmapStats(() => ({
  beatmap: props.beatmap,
  modBits: props.modBits,
  overrides: { ...props.statOverrides, ...localEdits },
}));

const mapDefaults = computed(() => {
  if (!osuFile.value || stats.value.status !== "ready") return null;
  return {
    cs: osuFile.value.cs,
    ar: osuFile.value.ar,
    od: osuFile.value.od,
  };
});

watch(
  () => [osuFile.value, props.statOverrides, clockRateDefault.value] as const,
  ([osu, overrides, rateDefault]) => {
    if (osu && stats.value.status === "ready") {
      localEdits.cs = overrides?.cs ?? osu.cs;
      localEdits.ar = overrides?.ar ?? osu.ar;
      localEdits.od = overrides?.od ?? osu.od;
      localEdits.clockRate =
        rateDefault === undefined ? undefined : (overrides?.clockRate ?? rateDefault);
    }
  },
  { immediate: true },
);

const statRows = computed(() => {
  if (stats.value.status !== "ready") return [];

  const { cs, ar, od } = stats.value;
  return [
    { key: "cs", label: "CS", base: localEdits.cs, effective: cs, digits: 2 },
    { key: "ar", label: "AR", base: localEdits.ar, effective: ar, digits: 2 },
    { key: "od", label: "OD", base: localEdits.od, effective: od, digits: 2 },
  ] as const;
});

const formatStat = (stat: { base: number; effective: number; digits: number }) => {
  const base = stat.base.toPrecision(stat.digits);
  if (almostEquals(stat.base, stat.effective)) {
    return base;
  }
  return `${base} → ${stat.effective.toFixed(stat.digits)}`;
};

const setStat = (key: keyof typeof localEdits, value: number[]) => {
  const scale = key === "clockRate" ? 100 : 10;
  localEdits[key] = Math.round(value[0]! * scale) / scale;
};

const handleOverride = (open: boolean) => {
  if (!open) {
    commitOverrides();
  }
};

const resolveEdits = (): StatOverrides => {
  const base = mapDefaults.value;
  if (!base) return {};

  const out = Object.fromEntries(
    diff(base, localEdits)
      .filter((e) => e.type !== "removed")
      .map((e) => [e.key, e.newValue!.value]),
  ) as StatOverrides;

  // absorb a clock rate that matches what the mods already give
  if (out.clockRate !== undefined && out.clockRate === clockRateDefault.value) {
    delete out.clockRate;
  }

  return out;
};

const commitOverrides = () => {
  if (!mapDefaults.value) return;
  emit("update:statOverrides", resolveEdits());
};

const editedKeys = computed(() => {
  const base = mapDefaults.value;
  if (!base) return new Set<string>();

  return new Set(
    diff(base, localEdits)
      .filter((e) => e.type !== "removed")
      .map((e) => e.key),
  );
});

const resetEdits = () => {
  if (!mapDefaults.value) return;
  Object.assign(localEdits, mapDefaults.value, { clockRate: clockRateDefault.value });
};
</script>

<template>
  <div v-if="stats.status === 'loading'">
    <Spinner />
  </div>
  <div v-else-if="stats.status === 'ready'" class="flex shrink-0 items-center justify-between">
    <Popover @update:open="handleOverride">
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
                'text-red-500': editedKeys.has(stat.key),
              }"
              >{{ stat.effective.toFixed(stat.digits) }}</span
            >
          </span>
        </div>
      </div>

      <span
        class="inline-block"
        tabindex="-1"
        :title="!allowedDiffAdjust ? 'Incompatible mod for difficulty adjust' : 'Difficuly adjust'"
      >
        <PopoverTrigger as-child>
          <Button :disabled="!allowedDiffAdjust" variant="ghost" size="icon-sm">
            <Icon name="fa7-solid:gear" />
          </Button>
        </PopoverTrigger>
      </span>
      <PopoverContent align="end" class="p-2 px-4">
        <div class="flex flex-col gap-2 text-xs">
          <Button @click="resetEdits" variant="ghost" size="icon-xs">
            <Icon name="fa7-solid:arrow-left-rotate" />
          </Button>
          <div v-for="stat in statRows" :key="stat.label" class="flex flex-col gap-1">
            <span>{{ stat.label }}: {{ formatStat(stat) }}</span>
            <Slider
              :model-value="[stat.base!]"
              :min="0"
              :max="10"
              :step="0.1"
              @update:model-value="(value) => setStat(stat.key, value!)"
            />
            <span
              class="text-primary flex w-full items-center justify-between gap-1 px-2 text-xs font-medium"
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
          <div v-if="allowedClockRateAdjust" class="flex flex-col gap-1">
            <span>Clock Rate: {{ localEdits.clockRate?.toFixed(2) }}</span>
            <Slider
              :model-value="[localEdits.clockRate!]"
              :min="clockRateBounds.min"
              :max="clockRateBounds.max"
              :step="0.01"
              @update:model-value="(value) => setStat('clockRate', value!)"
            />
            <span
              class="text-primary flex w-full items-center justify-between gap-1 px-2 text-xs font-medium"
              aria-hidden="true"
            >
              <span>{{ clockRateBounds.min }}</span>
              <span>{{ clockRateBounds.max }}</span>
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
  <div v-else>
    <span class="font-bold">Calculation aborted</span>
  </div>
</template>
