<script setup lang="ts">
import dayjs from "dayjs";

import { cn } from "~/lib/utils";

const { tournament } = useTournament();

const bannerImage = computed(
  () => tournament.value?.data?.banner ?? "/tournament-banner-full.jpeg",
);

const registrationDate = {
  label: "Registration",
  start: tournament.value?.data?.tournamentDates.playerRegs?.start,
  end: tournament.value?.data?.tournamentDates.playerRegs?.end,
};

const tournamentDates = (tournament.value?.data?.tournamentDates?.dates ?? []).map((date) => ({
  label: date.label,
  start: date.start,
  end: date.end,
}));

const dates = [registrationDate, ...tournamentDates];

const getStageStatusStyles = (startDate: string, endDate: string) => {
  const now = dayjs();

  if (now.isBefore(startDate)) {
    return "text-accent-foreground/80";
  }

  if (now.isAfter(endDate)) {
    return "text-accent-foreground/80 line-through";
  }

  return "bg-primary text-primary-foreground";
};
</script>

<template>
  <div v-if="tournament.data" class="flex size-full min-h-0 flex-1 flex-col">
    <div class="h-24 w-full shrink-0 border-b-2 sm:h-32">
      <NuxtImg
        :src="bannerImage"
        :alt="`${tournament.data.slug}-banner`"
        class="size-full object-cover object-top opacity-30"
      />
    </div>
    <div
      class="flex min-h-0 max-w-full flex-1 flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:gap-4 lg:p-6"
    >
      <Card class="size-full w-full lg:w-3/4">
        <CardHeader>
          <CardTitle class="text-3xl">{{ tournament.data.name }}</CardTitle>
        </CardHeader>
        <CardContent
          class="scrollbar-thumb-primary/80 scrollbar-track-none relative scrollbar-thin overflow-y-auto"
        >
          <Tabs default-value="description">
            <TabsList class="bg-card sticky top-0 w-full rounded-none">
              <TabsTrigger value="description"> Description </TabsTrigger>
              <TabsTrigger value="rules"> Rules </TabsTrigger>
            </TabsList>
            <TabsContent value="rules" class="h-full">
              <TournamentRules :slug="tournament.data.slug" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Card class="size-full w-full lg:w-1/4">
        <CardContent class="flex max-h-full flex-col space-y-6">
          <div class="flex flex-col gap-2">
            <Button class="h-11 w-full">Register as player</Button>
            <Button class="h-11 w-full">Apply for staff</Button>
          </div>
          <div
            class="bg-accent text-accent-foreground flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-md p-3"
          >
            <Tabs default-value="dates" class="flex min-h-0 flex-1 flex-col">
              <TabsList class="w-full">
                <TabsTrigger value="dates" class="flex-1">
                  <Icon name="fa7-solid:calendar" size="16" />
                  <span>Dates</span>
                </TabsTrigger>
                <TabsTrigger value="links" class="flex-1">
                  <Icon name="fa7-solid:link" size="16" />
                  <span>Links</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="dates" class="min-h-0 overflow-auto">
                <ul class="flex w-full flex-col space-y-1">
                  <li
                    v-for="date in dates"
                    :key="date.label"
                    :class="
                      cn(
                        'flex flex-col gap-0.5 rounded-md p-2 text-sm',
                        getStageStatusStyles(
                          date.start ?? new Date().toDateString(),
                          date.end ?? new Date().toDateString(),
                        ),
                      )
                    "
                  >
                    <span class="font-semibold">{{ date.label }}</span>
                    <span
                      >{{ dayjs(date.start).format("YYYY/MM/DD") }} -
                      {{ dayjs(date.end).format("YYYY/MM/DD") }}</span
                    >
                  </li>
                </ul>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
