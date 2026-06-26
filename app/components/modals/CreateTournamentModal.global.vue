<script setup lang="ts">
const { createTournament } = useTournamentsList();
</script>

<template>
  <DialogHeader>
    <DialogTitle>Create tournament</DialogTitle>
  </DialogHeader>
  <TournamentCreateForm @submit="createTournament" />
</template>
