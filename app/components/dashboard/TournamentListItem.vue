<script setup lang="ts">
import type { ArrayElement } from "~/types/util";

type A = ArrayElement<ReturnType<typeof useTournamentsList>["tournaments"]["value"]>;

const { tournament } = defineProps<{
  tournament: A;
}>();

const bannerImage = computed(() => tournament.logo ?? "/tournament-banner-thumb.jpeg");
</script>

<template>
  <div
    class="group hover:bg-muted/60 focus-within:bg-muted/60 flex items-center gap-4 rounded-md px-4 py-3 transition-colors"
  >
    <div
      class="bg-muted h-10 w-16 shrink-0 overflow-hidden rounded-sm bg-cover bg-center bg-no-repeat"
      :style="{ backgroundImage: `url(${bannerImage})` }"
    ></div>
    <div class="min-w-0 flex-1">
      <p class="truncate font-medium">{{ tournament.name }}</p>
      <p class="text-muted-foreground truncate text-sm">{{ tournament.slug }}</p>
    </div>
    <Icon
      name="fa7-solid:chevron-right"
      class="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
    />
  </div>
</template>
