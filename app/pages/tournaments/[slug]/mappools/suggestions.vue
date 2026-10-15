<script setup lang="ts">
import { useRouteQuery } from "@vueuse/router";

import { mapppoolSuggestionsQuery } from "~/queries/mappools";
import { roundsQuery } from "~/queries/rounds";

const route = useRoute("tournaments-slug");

const { data: rounds, refresh } = useQuery(() => roundsQuery({ slug: route.params.slug }));

await refresh();

const activeRound = computed(() => rounds.value?.[0]);
const selectedRoundId = useRouteQuery("roundId", activeRound.value?.id, {
  transform: Number,
  mode: "push",
});

const selectedRound = computed(() => {
  return rounds.value?.find((round) => round.id === selectedRoundId.value);
});

const enabled = computed(() => !!selectedRoundId.value);

const { state: mappool } = useQuery(() => ({
  ...mapppoolSuggestionsQuery({ slug: route.params.slug, roundId: selectedRoundId.value! }),
  enabled: enabled.value,
}));
</script>

<template>
  <h1 class="text-2xl">Mappools</h1>
  <template v-if="!activeRound">
    <p>In order to start mappooling, you need to configure a round first.</p>
    <NuxtLink :to="`/tournaments/${route.params.slug}/rounds`">
      <Button>Configure rounds</Button>
    </NuxtLink>
  </template>
  <template v-else>
    <Select v-model="selectedRoundId" :defaultValue="selectedRoundId">
      <SelectTrigger class="mt-2">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="round in rounds?.toReversed()" :value="round.id">
          {{ round.name }}
        </SelectItem>
      </SelectContent>
    </Select>
    <template v-if="mappool.status === 'success'">
      <DnDProvider>
        <Transition
          mode="out-in"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
          enter-active-class="transition-opacity duration-200"
          leave-active-class="transition-opacity duration-200"
        >
          <TournamentMappoolsSuggestionsList
            :key="selectedRoundId"
            :roundId="selectedRoundId"
            :mappoolSuggestions="mappool.data"
            :mappoolSlots="selectedRound?.mappoolSlots ?? []"
          />
        </Transition>
      </DnDProvider>
    </template>
  </template>
</template>
