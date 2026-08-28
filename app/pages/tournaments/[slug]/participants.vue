<script setup lang="ts">
import { buildUrl } from "~/lib/utils";

const { tournament } = useTournament();

const slug = tournament.value.data?.slug;

const { data } = useQuery({
  key: () => ["participants", slug!],
  query: () => $fetch(`/api/tournaments/${slug}/participants`),
  enabled: !!slug,
});

const players = computed(() => data.value?.toSorted((a, b) => a.rank - b.rank));
</script>

<template>
  <div v-if="players">
    <div class="mb-5 flex flex-col">
      <h1 class="text-2xl font-bold">Participants</h1>
      <h2>{{ players.length }} participant{{ players.length !== 1 ? "s" : "" }}</h2>
    </div>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-4">
      <div
        v-for="participant in players"
        class="bg-sidebar max-w-2lg flex h-30 items-center rounded-md p-4"
      >
        <div class="flex w-full items-center gap-5">
          <Avatar class="size-20 rounded-md">
            <AvatarImage :src="buildUrl.userAvatar(participant.osuId)" />
          </Avatar>
          <div class="flex size-full flex-col text-xl">
            <div class="flex items-center gap-2">
              <span>{{ participant.username }}</span>
              <NuxtLink external :to="`https://osu.ppy.sh/u/${participant.osuId}`" target="_blank">
                <OsuIcon />
              </NuxtLink>
            </div>
            <div
              v-if="participant.discord"
              class="text-muted-foreground flex items-center gap-1 text-xs"
            >
              <Icon name="fa7-brands:discord" />
              <span>{{ participant.discord }}</span>
            </div>
            <div
              class="bg-accent mt-2 flex w-full max-w-30 flex-1 items-center gap-4 rounded-md p-1 px-2"
            >
              <span
                :style="{
                  'background-image': `url(${buildUrl.countryFlag(participant.countryCode)})`,
                }"
                class="size-6 shrink-0"
              />
              <span class="text-sm">#{{ participant.rank }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
