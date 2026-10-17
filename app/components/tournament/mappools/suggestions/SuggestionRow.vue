<script setup lang="ts">
import { getEnumMods, getModsEnum } from "osu-web.js";
import { APPLIABLE_OSU_MODS, isOsuMod } from "~~/shared/osu/mods";
import type { UpdateMappoolEntry } from "~~/shared/validation/tournament/mappools";

import { DEFAULT_MOD_COLOR_MAP } from "~/lib/mods";
import { buildUrl } from "~/lib/utils";
import { useUpdateMappoolSuggestion } from "~/mutations/mappools";
import type { MappoolSuggestions } from "~/queries/mappools";

import SuggestedBy from "./SuggestedBy.vue";

const props = defineProps<{ entry: MappoolSuggestions[number]; roundId: number }>();
const emit = defineEmits<{ delete: [] }>();
const beatmap = computed(() => props.entry.beatmap);

const isAssigned = computed(() => props.entry.slot !== null && props.entry.position !== null);

const { update } = useUpdateMappoolSuggestion();
const saveSuggestion = (input: UpdateMappoolEntry) => {
  update({
    roundId: props.roundId,
    suggestionId: props.entry.id,
    body: input,
  });
};

const { user } = useUserSession();

const note = toRef(props.entry.note ?? "");
const noteChanged = computed(() => note.value !== (props.entry.note ?? ""));

const saveNote = () => {
  if (!noteChanged.value) return;

  saveSuggestion({
    note: note.value,
  });
};

const modBits = toRef(() => props.entry.modBits);
const isFm = toRef(() => props.entry.isFm);
const saveMods = (modBits: number) => {
  saveSuggestion({
    modBits,
  });
};

const saveFm = () => {
  saveSuggestion({
    isFm: !props.entry.isFm,
  });
};

const mod = computed(() => {
  if (isFm.value) return "FM";
  if (modBits.value === 0) return "NM";
  return getEnumMods(modBits.value)
    .map((m) => m)
    .join("");
});

const dragItem = useTemplateRef("dragItem");

const { isDragging } = makeDraggable(dragItem, {
  dragHandle: ".drag-handler",
  // modifier: {
  //   keys: ["AltLeft"],
  //   method: "every",
  // },
  data: () => ({
    suggestionId: props.entry.id,
    roundId: props.roundId,
  }),
});
</script>

<template>
  <div
    ref="dragItem"
    :data-is-dragging="isDragging"
    :class="
      cn(
        'col-span-full grid grid-cols-(--suggestion-grid-cols) items-center gap-x-2 rounded-md border-2 px-2 py-1 text-xs',
        isAssigned ? 'bg-green-700/10' : 'hover:bg-muted/40 bg-card',
      )
    "
  >
    <NuxtLink
      v-if="beatmap.beatmapId"
      :to="buildUrl.beatmapUrl(beatmap.beatmapId)"
      external
      target="_blank"
      class="hover:underline"
    >
      <span>{{ beatmap.beatmapId }}</span>
    </NuxtLink>
    <span v-else class="italic opacity-50">custom</span>

    <SuggestedBy :osu-id="entry.submittedByUser.osuId" :username="entry.submittedByUser.username" />

    <div class="flex min-w-0 items-center gap-2">
      <NuxtImg
        v-if="beatmap.beatmapsetId"
        :src="buildUrl.beatmapsetCover(beatmap.beatmapsetId)"
        alt=""
        class="h-8 w-16 shrink-0 rounded object-cover"
      />
      <div v-else class="bg-muted h-8 w-16 shrink-0 rounded" />
      <span class="truncate text-xs">
        {{ beatmap.artist }} - {{ beatmap.title }} [{{ beatmap.difficulty }}]
      </span>
    </div>

    <div class="flex items-center gap-1">
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
              : 'bg-(--mod-color)/10! text-(--mod-color)! opacity-60 transition-colors hover:bg-(--mod-color)/30!',
          )
        "
        :disabled="isAssigned"
        title="Toggle freemod"
        @click="saveFm"
        >FM</Button
      >
      <Popover>
        <PopoverTrigger as-child>
          <Button
            variant="outline"
            size="icon"
            :style="{
              '--mod-color': `${DEFAULT_MOD_COLOR_MAP[mod] ?? '#FFFFFF'}`,
            }"
            class="text-shadow bg-(--mod-color)/30! text-xs text-(--mod-color)! hover:bg-(--mod-color)/50!"
            :disabled="isAssigned || isFm"
            >{{ mod }}</Button
          >
          <span class="ml-1 text-[10px] font-bold" v-if="entry.statOverrides?.clockRate"
            >({{ entry.statOverrides?.clockRate }}x)</span
          >
        </PopoverTrigger>
        <PopoverContent class="p-2">
          <LazyToggleGroup
            :model-value="modBits"
            @update:model-value="(val) => saveMods(val as number)"
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

    <div>
      <TournamentMappoolsSuggestionsStats
        :beatmap="entry.beatmap"
        :mod-bits="isFm ? 0 : entry.modBits"
        :stat-overrides="entry.statOverrides ?? undefined"
        @update:stat-overrides="(o) => saveSuggestion({ statOverrides: o })"
      />
    </div>

    <div>
      <p
        v-if="props.entry.submittedByUser.osuId !== user?.osuId"
        class="max-h-20 scrollbar-thin overflow-y-auto wrap-break-word"
      >
        {{ props.entry.note ?? "---" }}
      </p>
      <Textarea
        v-else
        v-model.trim="note"
        @blur="saveNote"
        @keydown.stop
        autocomplete="off"
        placeholder="Something notable about the map..."
        class="max-h-20 min-h-10 text-xs! placeholder:text-xs!"
      />
    </div>

    <div class="flex h-full items-center justify-end gap-3">
      <Button
        v-if="props.entry.submittedByUser.osuId === user?.osuId"
        variant="ghost"
        size="icon-xs"
        class="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        @click="emit('delete')"
        title="Remove suggestion"
      >
        <Icon size="14" name="fa7-solid:trash-alt" />
      </Button>
      <div class="drag-handler flex h-full items-center hover:cursor-move">
        <Icon size="16" name="fa7-solid:grid-vertical" class="shrink-0"></Icon>
      </div>
    </div>
  </div>
</template>
