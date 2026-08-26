<script setup lang="ts">
import type { TournamentLink } from "~~/shared/validation/tournament-links";

import { typeIconMap } from "~/lib/links";

const { links } = defineProps<{
  links: TournamentLink[];
}>();
</script>

<template>
  <div class="flex flex-col gap-1">
    <div
      v-for="link in links"
      :key="link.label"
      class="bg-primary/15 flex items-center gap-4 rounded-md px-2 py-1"
    >
      <Icon :name="typeIconMap[link.type]" size="24" />
      <div class="flex flex-col items-baseline">
        <span>{{ link.label }}</span>
        <NuxtLink :to="link.url" external class="w-fit">
          <span class="text-accent-foreground dark:text-primary text-xs underline">{{
            link.url
          }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
