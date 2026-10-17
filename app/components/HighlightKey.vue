<script setup lang="ts">
import { useMagicKeys } from "@vueuse/core";

const props = defineProps<{
  modifier: string;
}>();

const keys = useMagicKeys();

const pressedKey = keys[props.modifier];
</script>

<template>
  <kbd
    :class="
      cn(
        'bg-muted rounded border px-1 py-0.5 text-[10px] leading-none uppercase transition-all',
        pressedKey && 'text-primary bg-muted bg-opacity-15 opacity-100',
      )
    "
  >
    {{ modifier }}
  </kbd>
</template>
