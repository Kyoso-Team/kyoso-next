<script setup lang="ts">
import type { BWSSettings } from "~~/server/utils/validation/tournament";

const {
  bwsSettings = {
    type: "linear",
    x: 0.9937,
    y: 2,
    z: 1,
  },
} = defineProps<{
  bwsSettings?: Partial<BWSSettings>;
}>();
</script>

<template>
  <template v-if="bwsSettings.type === 'linear'">
    BWS = rank ^ ({{ bwsSettings.x }} ^ (badges ^ {{ bwsSettings.y }}))
  </template>
  <template v-else>
    BWS = rank ^ ({{ bwsSettings.x }} ^ ((badges*(badges+{{ bwsSettings.y }}))/{{ bwsSettings.z }})
  </template>
</template>
