<script setup lang="ts">
import type { TeamRegistrationCondition } from "./types";

const { conditions } = defineProps<{
  conditions: TeamRegistrationCondition[];
}>();
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      v-for="condition in conditions"
      :key="condition.label"
      class="flex items-center gap-2 text-sm"
    >
      <Icon
        :name="condition.done ? 'fa7-solid:circle-check' : 'fa7-regular:circle'"
        :class="condition.done ? 'text-green-500' : 'text-muted-foreground'"
      />
      <span :class="condition.done ? '' : 'text-muted-foreground'">{{ condition.label }}</span>
    </div>
  </div>
</template>
