<script setup lang="ts">
const { data: tournament } = useTournament();
</script>

<template>
  <div v-if="tournament" class="flex max-w-screen gap-3 overflow-visible">
    <TournamentAsset :img="tournament.logo" type="logo" />
    <TournamentAsset :img="tournament.banner" type="banner" />
  </div>
</template>
