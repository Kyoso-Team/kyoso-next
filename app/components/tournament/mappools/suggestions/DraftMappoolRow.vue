<script setup lang="ts">
import { getEnumMods, getModsEnum } from "osu-web.js";
import { APPLIABLE_OSU_MODS, isOsuMod } from "~~/shared/osu/mods";

import Zone from "~/components/(drag-&-drop)/Zone.vue";
import { DEFAULT_MOD_COLOR_MAP } from "~/lib/mods";
import { buildUrl } from "~/lib/utils";
import { addMappoolSuggestionMutation, useUpdateMappoolSuggestion } from "~/mutations/mappools";
import type { MappoolSuggestions } from "~/queries/mappools";

import DraftMappoolStats from "./DraftMappoolStats.vue";

const props = defineProps<{
  slot: string;
  position: number;
  roundId: number;
  suggestion: MappoolSuggestions[number] | undefined;
}>();

const modBits = toRef(() => props.suggestion?.modBits ?? 0);
const isFm = toRef(() => props.suggestion?.isFm ?? false);
const mod = computed(() => {
  if (modBits.value === 0) return "NM";
  return getEnumMods(modBits.value)
    .map((m) => m)
    .join("");
});

const {
  mutateAsync: addSuggestion,
  isLoading,
  error,
  reset,
} = useMutation(addMappoolSuggestionMutation());

const { update } = useUpdateMappoolSuggestion();

const poolingNote = ref(props.suggestion?.poolingNote ?? "");
const poolingNoteChanged = computed(
  () => poolingNote.value !== (props.suggestion?.poolingNote ?? ""),
);

const showInput = ref(false);
const suggestedBeatmapId = ref<number>();

const cancelAddingSuggestion = () => {
  showInput.value = false;
  suggestedBeatmapId.value = undefined;
  reset();
};

const submitSuggestion = async () => {
  if (!suggestedBeatmapId.value) return;
  await addSuggestion({
    beatmapId: suggestedBeatmapId.value,
    roundId: props.roundId,
    slot: props.slot,
    position: props.position,
  }).then(() => {
    cancelAddingSuggestion();
  });
};

const handleDrop = (val: { suggestionId: number; roundId: number }) => {
  if (val.suggestionId === props.suggestion?.id) return;
  update({
    roundId: val.roundId,
    suggestionId: val.suggestionId,
    body: {
      slot: props.slot,
      position: props.position,
    },
  });
};

const handleModChange = (modBits: number) => {
  if (!props.suggestion) return;
  update({
    roundId: props.suggestion.roundId,
    suggestionId: props.suggestion.id,
    body: {
      modBits,
    },
  });
};

const handleFmToggle = () => {
  if (!props.suggestion) return;
  update({
    roundId: props.suggestion.roundId,
    suggestionId: props.suggestion.id,
    body: {
      isFm: !props.suggestion.isFm,
    },
  });
};

const savePoolingNote = () => {
  if (!props.suggestion || !poolingNoteChanged.value) return;
  update({
    roundId: props.suggestion.roundId,
    suggestionId: props.suggestion.id,
    body: {
      poolingNote: poolingNote.value,
    },
  });
};

const clearSuggestion = () => {
  if (!props.suggestion) return;
  update({
    roundId: props.suggestion.roundId,
    suggestionId: props.suggestion.id,
    body: {
      position: null,
      slot: null,
    },
  });
};
</script>

<template>
  <Zone
    :data-assigned="!!suggestion"
    :drag-data="suggestion ? () => ({ suggestionId: suggestion!.id, roundId }) : undefined"
    @drop="handleDrop"
    class="col-span-full grid h-12 grid-cols-subgrid items-center rounded-md border-2 px-2 text-xs data-[assigned=false]:border-dashed"
    :style="{
      borderColor: `${DEFAULT_MOD_COLOR_MAP[slot] ?? '#FFFFFF'}80`,
    }"
    :background-color="`${DEFAULT_MOD_COLOR_MAP[slot]}30`"
  >
    <div v-if="!suggestion" class="col-span-full text-center">
      <div class="flex items-center justify-center gap-2">
        <template v-if="!showInput">
          <span>No map</span>
          <Button @click="showInput = true" size="icon-xs" variant="outline">
            <Icon name="fa7-solid:plus" />
          </Button>
        </template>
        <div v-else class="flex flex-col gap-0.5">
          <div class="flex items-center gap-5">
            <Input
              v-model.number="suggestedBeatmapId"
              class="text-xs! focus-visible:ring-0"
              placeholder="Beatmap ID"
              @keydown.enter="submitSuggestion"
            />
            <div class="flex w-full gap-1">
              <Button
                variant="outline"
                size="icon-xs"
                :disabled="!suggestedBeatmapId || isLoading"
                @click="submitSuggestion"
              >
                <template v-if="isLoading">
                  <Spinner />
                </template>
                <Icon v-else name="fa7-solid:check" />
              </Button>
              <Button variant="destructive" size="icon-xs" @click="cancelAddingSuggestion">
                <Icon name="fa7-solid:x" />
              </Button>
            </div>
          </div>
          <span class="text-destructive text-xs" v-if="error">{{ apiErrorMessage(error) }}</span>
        </div>
      </div>
    </div>
    <template v-else>
      <div v-if="suggestion.beatmap.beatmapsetId" class="relative shrink-0">
        <NuxtImg
          :src="buildUrl.beatmapsetCover(suggestion.beatmap.beatmapsetId)"
          alt=""
          class="h-8 w-16 rounded object-cover"
        />
        <span
          v-if="suggestion.statOverrides?.clockRate"
          class="absolute inset-x-0 bottom-0 w-16 rounded-b bg-black/70 px-0.5 text-center text-[10px] leading-3 font-bold text-white"
        >
          {{ suggestion.statOverrides.clockRate }}x
        </span>
      </div>
      <span class="content-center"> {{ suggestion.slot }}{{ suggestion.position }} </span>
      <div class="flex items-center justify-center gap-1">
        <Button
          variant="outline"
          size="icon-xs"
          :style="{
            '--mod-color': DEFAULT_MOD_COLOR_MAP.FM,
          }"
          :class="
            cn(
              'text-[10px]',
              isFm
                ? 'border-(--mod-color)! bg-(--mod-color)/40! text-(--mod-color)!'
                : 'bg-(--mod-color)/30! text-(--mod-color)! opacity-60 hover:bg-(--mod-color)/50!',
            )
          "
          title="Toggle freemod"
          @click="handleFmToggle"
          >FM</Button
        >
        <Popover>
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              size="icon"
              class="text-shadow text-xs"
              :style="{
                backgroundColor: `${DEFAULT_MOD_COLOR_MAP[mod] ?? '#FFFFFF'}30`,
                color: `${DEFAULT_MOD_COLOR_MAP[mod] ?? '#FFFFFF'}`,
              }"
              >{{ mod }}</Button
            >
          </PopoverTrigger>
          <PopoverContent class="p-2">
            <LazyToggleGroup
              type="single"
              :model-value="modBits"
              @update:model-value="(val) => handleModChange(val as number)"
              class="flex gap-2"
            >
              <LazyToggleGroupItem
                v-for="mod in APPLIABLE_OSU_MODS"
                :style="{
                  '--mod-color': DEFAULT_MOD_COLOR_MAP[mod] ?? '#FFFFFF',
                }"
                class="size-8 rounded-md! border-(--mod-color)/70 bg-(--mod-color)/30 text-xs text-(--mod-color)! transition-colors hover:bg-(--mod-color)/50 data-[state=on]:border data-[state=on]:bg-(--mod-color)/20"
                :value="mod === 'NM' ? 0 : isOsuMod(mod) ? getModsEnum([mod]) : 0"
              >
                {{ mod }}
              </LazyToggleGroupItem>
            </LazyToggleGroup>
          </PopoverContent>
        </Popover>
      </div>
      <span class="truncate">
        {{ suggestion.beatmap.artist }} - {{ suggestion.beatmap.title }} [{{
          suggestion.beatmap.difficulty
        }}]
      </span>

      <DraftMappoolStats
        :beatmap="suggestion.beatmap"
        :mod-bits="suggestion.modBits"
        :overrides="suggestion.statOverrides"
      />
      <Input
        v-model.trim="poolingNote"
        class="h-8 text-xs!"
        placeholder="Anything notable..."
        autocomplete="off"
        @blur="savePoolingNote"
        @keydown.stop
      />
      <div class="flex h-full items-center justify-end gap-3">
        <Button
          variant="ghost"
          size="icon-xs"
          class="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          @click="clearSuggestion"
          title="Clear suggestion"
        >
          <Icon size="14" name="fa7-solid:x" />
        </Button>
      </div>
    </template>
  </Zone>
</template>
