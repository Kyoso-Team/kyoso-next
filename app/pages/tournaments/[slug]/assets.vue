<script setup lang="ts">
const route = useRoute("tournaments-slug");

const { data: tournament } = useTournament(route.params.slug);
</script>

<template>
  <div v-if="tournament" class="flex max-w-screen gap-3 overflow-visible">
    <TournamentAsset :img="tournament.logo" type="logo" />
    <TournamentAsset :img="tournament.banner" type="banner" />
  </div>
</template>
