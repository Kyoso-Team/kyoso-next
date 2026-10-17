<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";

import { DEFAULT_MOD_COLOR_MAP } from "~/lib/mods";
import { addMappoolSuggestionMutation, useRemoveMappoolSuggestion } from "~/mutations/mappools";
import { type MappoolSuggestions } from "~/queries/mappools";
import { apiErrorMessage } from "~/utils/api";

import DraftMappoolRow from "./DraftMappoolRow.vue";
import SuggestionRow from "./SuggestionRow.vue";
import SuggestionHeader from "./SuggestionsHeader.vue";

const props = defineProps<{
  roundId: number;
  mappoolSlots: { name: string; count: number }[];
  mappoolSuggestions: MappoolSuggestions;
}>();

const isFinePointer = useMediaQuery("(pointer: fine)");

const assignedSuggestions = computed(() => {
  return props.mappoolSuggestions.filter((suggestion) => {
    return suggestion.position && suggestion.slot;
  });
});

const getAssignedSuggestion = (slot: string, position: number) => {
  return assignedSuggestions.value.find((sugg) => sugg.slot === slot && sugg.position === position);
};

const {
  mutateAsync: addSuggestion,
  isLoading,
  error,
  reset,
} = useMutation(addMappoolSuggestionMutation());

const showInput = ref(false);
const suggestedBeatmapId = ref<number>();

const cancelAddingSuggestion = () => {
  showInput.value = false;
  suggestedBeatmapId.value = undefined;
  reset();
};

const submitSuggestion = async () => {
  if (!suggestedBeatmapId.value) return;
  await addSuggestion({ beatmapId: suggestedBeatmapId.value, roundId: props.roundId }).then(() => {
    cancelAddingSuggestion();
  });
};

const { remove } = useRemoveMappoolSuggestion();

const dndProvider = useDnDProvider();

watchEffect(() => {
  if (dndProvider.state.value === "dragging") {
    openSheet.value = true;
  }
});

const openSheet = ref(false);
</script>

<template>
  <Sheet :open="openSheet" @update:open="(open) => (openSheet = open)">
    <div class="mt-2 flex min-h-0 flex-1 items-start justify-between gap-5">
      <div class="flex max-h-full min-h-0 w-fit flex-col gap-2">
        <h2 class="text-xl">Suggestions</h2>
        <div class="min-h-0 flex-1 overflow-auto">
          <div class="grid grid-cols-(--suggestion-grid-cols) gap-2">
            <SuggestionHeader />
            <SuggestionRow
              v-for="suggestion in props.mappoolSuggestions"
              :key="suggestion.id"
              :entry="suggestion"
              :round-id="roundId"
              @delete="
                () =>
                  remove({
                    suggestionId: suggestion.id,
                    roundId,
                  })
              "
            />
          </div>
        </div>

        <div class="w-full">
          <Button
            v-if="!showInput"
            variant="ghost"
            class="flex h-10 w-full items-center justify-center rounded-md border-2 border-dashed italic opacity-70"
            @click="showInput = true"
          >
            <Icon name="fa7-solid:plus"></Icon>
            Add suggestion
          </Button>
          <div class="flex flex-col gap-0.5" v-else>
            <div class="flex w-75 gap-5 px-1 py-2">
              <Input
                v-model.number="suggestedBeatmapId"
                class="w-40 focus-visible:ring-0"
                placeholder="Beatmap ID"
                @keydown.enter="submitSuggestion"
              ></Input>
              <div class="flex w-full gap-1">
                <Button
                  variant="outline"
                  :disabled="!suggestedBeatmapId || isLoading"
                  @click="submitSuggestion"
                >
                  <template v-if="isLoading">
                    <Spinner />
                  </template>
                  <span v-else>Submit</span>
                </Button>
                <Button variant="destructive" @click="cancelAddingSuggestion">Cancel</Button>
              </div>
            </div>
            <span class="text-destructive text-xs" v-if="error">{{ apiErrorMessage(error) }}</span>
          </div>
        </div>
      </div>
      <div class="h-full">
        <Button @click="openSheet = true" class="h-full text-xl"> > </Button>
      </div>
      <SheetContent class="min-h-0 flex-1 overflow-hidden sm:max-w-6xl">
        <SheetHeader class="bg-card sticky top-0 z-15">
          <SheetTitle>Draft mappool</SheetTitle>
          <SheetDescription>
            View and edit the mappool here.
            <span
              v-if="isFinePointer"
              class="text-muted-foreground flex items-center gap-1.5 font-medium"
            >
              Hold
              <HighlightKey modifier="Ctrl" />
              to start dragging maps
            </span>
          </SheetDescription>
        </SheetHeader>
        <div class="min-h-0 flex-1 overflow-y-auto">
          <div class="grid grid-cols-(--draft-rows-grid-cols) gap-2 px-4 pb-2">
            <div
              class="bg-background sticky top-0 z-10 col-span-full grid grid-cols-subgrid px-2 pb-2 text-xs"
            >
              <span>Banner</span>
              <span>Slot</span>
              <span>Mod</span>
              <span>Artist - Title [Difficulty]</span>
              <span>SR</span>
              <span>BPM</span>
              <span>Length</span>
              <span>CS</span>
              <span>AR</span>
              <span>OD</span>
              <span class="text-center">Notes</span>
              <span id="actions"></span>
            </div>
            <div
              v-for="mappoolSlot in mappoolSlots"
              :key="mappoolSlot.name"
              class="col-span-full grid grid-cols-subgrid gap-1.5"
              :style="{
                color: DEFAULT_MOD_COLOR_MAP[mappoolSlot.name] ?? '#FFFFFF',
              }"
            >
              <DraftMappoolRow
                v-for="slotNumber in mappoolSlot.count"
                :key="
                  getAssignedSuggestion(mappoolSlot.name, slotNumber)?.id ??
                  `empty-${mappoolSlot.name}-${slotNumber}`
                "
                :suggestion="getAssignedSuggestion(mappoolSlot.name, slotNumber)"
                :slot="mappoolSlot.name"
                :position="slotNumber"
                :round-id="roundId"
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </div>
  </Sheet>
</template>
