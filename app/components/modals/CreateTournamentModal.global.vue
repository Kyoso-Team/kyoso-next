<script setup lang="ts">
const { createTournament } = useTournamentsList();
</script>

<template>
  <DialogHeader>
    <DialogTitle>Create tournament</DialogTitle>
    <DialogDescription>Provide initial tournament details to get started.</DialogDescription>
  </DialogHeader>
  <TournamentCreateForm @submit="createTournament" />
</template>
