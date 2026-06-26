<script setup lang="ts">
import type { ArrayElement } from "~/types/util";

type A = ArrayElement<ReturnType<typeof useTournamentsList>["tournaments"]["value"]>;

const { tournament } = defineProps<{
  tournament: A;
}>();

const bannerImage = computed(() => tournament.banner ?? "/tournament-banner-thumb.jpeg");
</script>

<template>
  <Card
    class="group hover:border-ring/60 focus-within:border-ring focus-within:ring-ring/50 overflow-hidden pt-0 transition-all focus-within:ring-[3px] hover:shadow-md"
  >
    <CardContent
      class="relative block aspect-21/9 min-h-20 overflow-hidden rounded-t-md bg-cover bg-center bg-no-repeat"
      :style="{ backgroundImage: `url(${bannerImage})` }"
    >
      <span
        v-if="!tournament.banner"
        aria-hidden="true"
        class="absolute inset-0 z-1 flex items-center justify-center px-4 text-center text-xl/6 font-semibold text-white select-none"
      >
        {{ tournament.name }}
      </span>
    </CardContent>
    <CardFooter>
      <CardTitle class="line-clamp-2 text-base">{{ tournament.name }}</CardTitle>
    </CardFooter>
  </Card>
</template>
