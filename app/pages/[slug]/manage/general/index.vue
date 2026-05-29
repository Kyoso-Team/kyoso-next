<script setup lang="ts">
import { toast } from "vue-sonner";
import type { UpdateTournament } from "~~/shared/validation/tournaments";

const route = useRoute("slug-manage");
const { data: tournament, refresh } = await useTournament(route.params.slug);

const updateTournament = async (values: UpdateTournament) => {
  await $fetch(`/api/tournaments/${route.params.slug}`, {
    // @ts-expect-error
    method: "PATCH",
    body: values,
  }).then(async () => {
    toast.info("Tournament updated");
    await refresh();
  });
};
</script>

<template>
  <div v-if="tournament">
    <TournamentGeneralSettings @submit="updateTournament" :tournament="tournament" />
  </div>
</template>
