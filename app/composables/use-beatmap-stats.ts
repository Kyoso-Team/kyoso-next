import { Beatmap, BeatmapAttributesBuilder, Difficulty } from "rosu-pp-js";

import { $fetch } from "#build/fetch";

export type StatOverrides = { cs?: number; ar?: number; od?: number; clockRate?: number };

export type BeatmapStatsInput = {
  beatmap: { id: number; hitLength: number };
  modBits?: number;
  overrides?: StatOverrides | null;
};

export type BeatmapStats =
  | { status: "loading" }
  | { status: "suspicious" }
  | {
      status: "ready";
      stars: number;
      bpm: number;
      length: number;
      cs: number;
      ar: number;
      od: number;
    };

export const useBeatmapStats = (input: MaybeRefOrGetter<BeatmapStatsInput>) => {
  const resolved = computed(() => toValue(input));

  const { data: fileContents } = useQuery(() => ({
    key: ["beatmap-osu", resolved.value.beatmap.id],
    query: () => $fetch<string>(`/api/beatmaps/${resolved.value.beatmap.id}`),
  }));

  const osuFile = shallowRef<Beatmap>();
  watch(
    fileContents,
    (content) => {
      osuFile.value?.free();
      osuFile.value = content === undefined ? undefined : new Beatmap(content);
    },
    { immediate: true },
  );
  onScopeDispose(() => osuFile.value?.free());

  const stats = computed((): BeatmapStats => {
    const map = osuFile.value;
    if (!map) return { status: "loading" };
    if (map.isSuspicious()) return { status: "suspicious" };

    const { beatmap, modBits = 0, overrides } = resolved.value;
    const args = { mods: modBits, ...overrides };

    // build() consumes the builder, so only the result needs freeing
    const attrs = new BeatmapAttributesBuilder({ map, ...args }).build();
    const difficulty = new Difficulty(args);
    const difficultyAttrs = difficulty.calculate(map);

    const result = {
      status: "ready",
      stars: difficultyAttrs.stars,
      bpm: map.bpm * attrs.clockRate,
      length: Math.round(beatmap.hitLength / attrs.clockRate),
      cs: attrs.cs,
      ar: attrs.ar,
      od: attrs.od,
    } satisfies BeatmapStats;

    attrs.free();
    difficultyAttrs.free();
    difficulty.free();
    return result;
  });

  return { osuFile, stats };
};

export const formatLength = (seconds: number) => {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};
