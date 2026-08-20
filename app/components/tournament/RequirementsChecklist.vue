<script setup lang="ts">
const { tournament } = useTournament();

const requirementsChecklist = computed(() => {
  return [
    { label: "Tournament Type", done: !!tournament.value?.data?.type },
    {
      label: "Rank Limits",
      done: tournament.value?.data?.isOpenRank || tournament.value?.data?.lowerRankLimit !== null,
    },
    {
      label: "Rules",
      done: !!tournament.value?.data?.rules?.trim(),
    },
    {
      label: "Registration Dates",
      done:
        tournament.value?.data?.tournamentDates.playerRegs?.start &&
        tournament.value?.data?.tournamentDates.playerRegs?.end,
    },
  ];
});
</script>
<template>
  <Card class="sticky top-0 mt-4 max-h-[80vh] w-1/4">
    <CardHeader>
      <CardTitle class="text-xl">Requirements Checklist</CardTitle>
      <CardDescription>
        Check off each requirement to ensure your tournament is ready to start.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ul>
        <li
          class="flex items-center gap-2"
          v-for="(item, index) in requirementsChecklist"
          :key="index"
        >
          <Icon v-if="item.done" name="fa7-solid:check-circle" class="text-green-500" />
          <Icon v-else name="fa7-solid:close" class="text-destructive" />
          <label>{{ item.label }}</label>
        </li>
      </ul>
    </CardContent>
  </Card>
</template>
