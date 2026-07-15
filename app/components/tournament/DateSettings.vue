<script setup lang="ts">
import { useForm } from "@formisch/vue";
import {
  tournamentDatesFormSchema,
  type TournamentDates,
} from "~~/shared/validation/tournament-dates";

const props = defineProps<{ dates: TournamentDates }>();

const dates = toRef(props.dates);

const form = useForm({
  schema: tournamentDatesFormSchema,
  initialInput: dates.value,
});
</script>

<template>
  <div>
    <h1 class="text-2xl">Dates</h1>
    <Card class="bg-background mt-4 flex w-full max-w-5xl justify-center">
      <CardContent> </CardContent>
    </Card>
  </div>
</template>
