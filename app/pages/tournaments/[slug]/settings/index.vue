<script setup lang="ts">
import { toast } from "vue-sonner";
import type { UpdateTournament } from "~~/shared/validation/tournaments";

const route = useRoute("tournaments-slug-settings");
const { data: tournament, refresh } = useTournament();

const { mutate: updateTournament } = useMutation({
  mutation: async (values: UpdateTournament) => {
    await $fetch(`/api/tournaments/${route.params.slug}`, {
      // @ts-expect-error
      method: "PATCH",
      body: values,
    }).then(async () => {
      toast.info("Tournament updated");
      await refresh();
    });
  },
});
</script>

<template>
  <div v-if="tournament" class="relative flex gap-3">
    <div class="flex w-3/4 flex-col gap-8 pb-4">
      <TournamentGeneralSettings @submit="updateTournament" :tournament="tournament" />
      <TournamentDateSettings :dates="tournament.tournamentDates" />
    </div>
    <TournamentRequirementsChecklist />
  </div>
</template>
