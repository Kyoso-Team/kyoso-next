<script setup lang="ts">
import dayjs from "dayjs";

import { cn } from "~/lib/utils";

const { tournament } = useTournament();

const bannerImage = computed(
  () => tournament.value?.data?.banner ?? "/tournament-banner-full.jpeg",
);

const dates: { stage: string; start: string; end: string }[] = [
  {
    stage: "Registration",
    start: Temporal.PlainDate.from({ year: 2026, month: 6, day: 1 }).toLocaleString(),
    end: Temporal.PlainDate.from({
      year: 2026,
      month: 6,
      day: 21,
      hour: 23,
      minute: 59,
      second: 59,
    }).toLocaleString(),
  },
  {
    stage: "Team Submission",
    start: Temporal.PlainDate.from({ year: 2026, month: 6, day: 23 }).toLocaleString(),
    end: Temporal.PlainDate.from({
      year: 2026,
      month: 6,
      day: 29,
      hour: 23,
      minute: 59,
      second: 59,
    }).toLocaleString(),
  },
  {
    stage: "Qualifiers",
    start: Temporal.PlainDate.from({ year: 2026, month: 7, day: 23 }).toLocaleString(),
    end: Temporal.PlainDate.from({
      year: 2026,
      month: 7,
      day: 29,
      hour: 23,
      minute: 59,
      second: 59,
    }).toLocaleString(),
  },
  {
    stage: "Group Stage",
    start: Temporal.PlainDate.from({ year: 2026, month: 7, day: 20 }).toLocaleString(),
    end: Temporal.PlainDate.from({
      year: 2026,
      month: 8,
      day: 9,
      hour: 23,
      minute: 59,
      second: 59,
    }).toLocaleString(),
  },
  {
    stage: "Round of 16",
    start: Temporal.PlainDate.from({ year: 2026, month: 8, day: 10 }).toLocaleString(),
    end: Temporal.PlainDate.from({
      year: 2026,
      month: 8,
      day: 16,
      hour: 23,
      minute: 59,
      second: 59,
    }).toLocaleString(),
  },
  {
    stage: "Quarterfinals",
    start: Temporal.PlainDate.from({ year: 2026, month: 8, day: 17 }).toLocaleString(),
    end: Temporal.PlainDate.from({
      year: 2026,
      month: 8,
      day: 23,
      hour: 23,
      minute: 59,
      second: 59,
    }).toLocaleString(),
  },
  {
    stage: "Semifinals",
    start: Temporal.PlainDate.from({ year: 2026, month: 8, day: 24 }).toLocaleString(),
    end: Temporal.PlainDate.from({
      year: 2026,
      month: 8,
      day: 30,
      hour: 23,
      minute: 59,
      second: 59,
    }).toLocaleString(),
  },
  {
    stage: "Finals",
    start: Temporal.PlainDate.from({ year: 2026, month: 8, day: 31 }).toLocaleString(),
    end: Temporal.PlainDate.from({
      year: 2026,
      month: 9,
      day: 6,
      hour: 23,
      minute: 59,
      second: 59,
    }).toLocaleString(),
  },
  {
    stage: "Grand Finals",
    start: Temporal.PlainDate.from({ year: 2026, month: 9, day: 7 }).toLocaleString(),
    end: Temporal.PlainDate.from({
      year: 2026,
      month: 9,
      day: 20,
      hour: 23,
      minute: 59,
      second: 59,
    }).toLocaleString(),
  },
];

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
                    :key="date.stage"
                    :class="
                      cn(
                        'flex flex-col gap-0.5 rounded-md p-2 text-sm',
                        getStageStatusStyles(date.start, date.end),
                      )
                    "
                  >
                    <span class="font-semibold">{{ date.stage }}</span>
                    <span>{{ date.start }} - {{ date.end }}</span>
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
