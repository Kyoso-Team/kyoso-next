<script setup lang="ts">
const { tournament } = useTournament();

const slug = tournament.value.data?.slug;

const { data } = useQuery({
  key: () => ["participants", slug!],
  query: () => $fetch(`/api/tournaments/${slug}/participants`),
  enabled: !!slug,
});

const participants = computed(() => {
  if (data.value?.type === "solo") {
    return {
      type: "solo" as const,
      data: data.value?.participants.toSorted((a, b) => a.rank - b.rank),
    };
  }
  return {
    type: "team" as const,
    data: data.value?.data.toSorted((a, b) => a.rank - b.rank),
  };
});
</script>

<template>
  <div v-if="participants.data">
    <div class="mb-5 flex flex-col">
      <h1 class="text-2xl font-bold">Participants</h1>
      <h2>
        {{ participants.data.length }} participant{{ participants.data.length !== 1 ? "s" : "" }}
      </h2>
    </div>
    <TournamentParticipantsSoloList
      v-if="participants.type === 'solo'"
      :players="participants.data"
    />
    <TournamentParticipantsTeamList v-else :teams="participants.data" />
  </div>
</template>
