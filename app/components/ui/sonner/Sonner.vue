<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner";
import { Toaster as Sonner } from "vue-sonner";

import { cn } from "cn";

const props = defineProps<ToasterProps>();
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
    }"
    v-bind="props"
  >
    <template #success-icon>
      <Icon name="fa7-solid:check-circle" size="18" class="size-4.5" />
    </template>
    <template #info-icon>
      <Icon name="fa7-solid:circle-info" size="18" class="size-4.5" />
    </template>
    <template #warning-icon>
      <Icon name="fa7-solid:exclamation-triangle" size="18" class="size-4.5" />
    </template>
    <template #error-icon>
      <Icon name="fa7-solid:circle-xmark" size="18" class="size-4.5" />
    </template>
    <template #loading-icon>
      <div>
        <Icon name="fa7-solid:arrows-spin" size="18" class="size-4.5 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <Icon name="fa7-solid:close" class="size-4" />
    </template>
  </Sonner>
</template>
