<script setup lang="ts">
import type { Team } from "~~/shared/types";

import { buildUrl } from "~/lib/utils";

defineProps<{
  teams: Team[];
}>();
</script>

<template>
  <div
    v-for="team in teams"
    :key="team.id"
    class="bg-sidebar flex w-full max-w-5xl flex-col items-start gap-6 rounded-md p-4"
  >
    <div class="flex items-center gap-3">
      <Avatar>
        <AvatarImage src="/favicon.svg" />
      </Avatar>
      <div class="flex flex-col">
        <span>{{ team.name }}</span>
        <span class="text-muted-foreground text-xs">#{{ team.rank }}</span>
      </div>
    </div>
    <div class="grid w-full grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
      <div v-for="member in team.participants" :key="member.id">
        <div class="bg-card flex max-w-full items-center gap-2 rounded-md p-2">
          <Avatar class="size-9">
            <AvatarImage :src="buildUrl.userAvatar(member.osuId)" />
            <AvatarFallback>{{ member.username[0] }}</AvatarFallback>
          </Avatar>
          <span
            :style="{
              'background-image': `url(${buildUrl.countryFlag(member.countryCode)})`,
            }"
            class="size-6 shrink-0"
          />
          <span class="truncate text-sm font-medium">{{ member.username }}</span>
          <span class="text-muted-foreground ml-auto shrink-0 text-xs"> #{{ member.rank }} </span>
        </div>
      </div>
    </div>
  </div>
</template>
