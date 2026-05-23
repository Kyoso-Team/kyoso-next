<script setup lang="ts">
import type { Tournament } from "../../pages/dashboard.vue";
const { tournament } = defineProps<{
  tournament: Tournament;
}>();

const bannerImage = computed(() => tournament.banner ?? "/tournament-banner-thumb.jpeg");
</script>

<template>
  <NuxtLink
    :to="`/tournaments/${tournament.slug}`"
    class="hover:bg-muted/50 flex items-center gap-4 rounded-md px-4 py-3 transition-colors"
  >
    <div
      class="bg-muted h-10 w-16 shrink-0 overflow-hidden rounded-sm bg-cover bg-center bg-no-repeat"
      :style="{ backgroundImage: `url(${bannerImage})` }"
    ></div>
    <div class="min-w-0 flex-1">
      <p class="truncate font-medium">{{ tournament.name }}</p>
      <p class="text-muted-foreground truncate text-sm">{{ tournament.slug }}</p>
    </div>
    <span class="text-muted-foreground shrink-0 text-sm">View</span>
  </NuxtLink>
</template>
