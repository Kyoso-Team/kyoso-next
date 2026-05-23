<script setup lang="ts">
import type { Tournament } from "../../pages/dashboard.vue";
const { tournament } = defineProps<{
  tournament: Tournament;
}>();

const bannerImage = computed(() => tournament.banner ?? "/tournament-banner-thumb.jpeg");
</script>

<template>
  <Card class="pt-0">
    <CardHeader class="hidden"> </CardHeader>
    <CardContent
      class="relative block aspect-21/9 min-h-20 overflow-hidden rounded-t-md bg-cover bg-center bg-no-repeat"
      :style="{
        backgroundImage: `url(${bannerImage})`,
      }"
    >
      <span
        v-if="!tournament.banner"
        class="font-violet-sans absolute inset-0 z-1 flex items-center justify-center px-4 text-center text-xl text-white select-none"
      >
        {{ tournament.name }}
      </span>
    </CardContent>
    <CardFooter>
      <h2>{{ tournament.name }}</h2>
    </CardFooter>
  </Card>
</template>
