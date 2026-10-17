<script setup lang="ts">
import { makeDraggable, makeDroppable } from "@vue-dnd-kit/core";
import { usePointer, useMagicKeys } from "@vueuse/core";
import { useTemplateRef, type HTMLAttributes } from "vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
  backgroundColor?: string;
  dragData?: () => unknown;
}>();

const bgColor = computed(() => props.backgroundColor ?? "#FFFFFF");

const emit = defineEmits<{
  drop: [
    entry: {
      suggestionId: number;
      roundId: number;
    },
  ];
}>();

const zoneRef = useTemplateRef<HTMLElement>("zoneRef");

const { isDragOver } = makeDroppable(zoneRef, {
  events: {
    onDrop: (e) => {
      const entry = e.draggedItems.at(0);
      if (!entry) return;
      emit(
        "drop",
        entry.data as {
          suggestionId: number;
          roundId: number;
        },
      );
    },
  },
});

const { pointerType } = usePointer();

const { isDragging } = makeDraggable(zoneRef, {
  disabled: computed(() => !props.dragData),
  modifier: pointerType.value !== "touch" ? { keys: ["ControlLeft"], method: "some" } : undefined,
  activation: {
    distance: 10,
  },
  // Necessary to make filled zone both draggable and droppable
  placementMargins: {},
  data: () => props.dragData?.(),
});

const { control } = useMagicKeys();
</script>

<template>
  <div
    ref="zoneRef"
    :data-dragging="isDragging"
    :class="
      cn(
        props.class,
        'zone',
        isDragOver && 'zone--over',
        dragData !== undefined && control && 'cursor-move',
      )
    "
  >
    <slot />
  </div>
</template>

<style scoped>
.zone {
  border-radius: 8px;
  transition:
    background-color 0.15s,
    border-color 0.15s;
  touch-action: none;
  user-select: none;
}

.zone--over {
  background-color: v-bind(bgColor);
}

.zone[data-dragging="true"] {
  opacity: 0.4;
}
</style>
