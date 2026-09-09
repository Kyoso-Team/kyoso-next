<script setup lang="ts">
import { refDebounced } from "@vueuse/core";

import { buildUrl } from "~/lib/utils";
import { OSU_USERS_QUERY_KEYS } from "~/queries/users";

import type { OsuUserSummary, ResolvedOsuUser } from "./types";

const { isDuplicate, slotNumber } = defineProps<{
  isDuplicate: boolean;
  slotNumber: number;
}>();

const emit = defineEmits<{
  resolved: [user: ResolvedOsuUser | null];
}>();

const raw = ref<number>();
const osuId = refDebounced(raw, 300);

const {
  state: osuUser,
  asyncStatus,
  isPlaceholderData,
} = useQuery({
  key: () => OSU_USERS_QUERY_KEYS.byOsuId(osuId.value!),
  query: () =>
    $fetch<OsuUserSummary>(`/api/prototype/osu-user/${osuId.value}`, {
      headers: useRequestHeaders(["cookie"]),
    }),
  staleTime: Infinity,
  enabled: () => osuId.value !== undefined && osuId.value !== null,
  placeholderData: (prev) => prev,
});

watch(
  () =>
    !isPlaceholderData.value && osuUser.value.status === "success"
      ? (osuUser.value.data ?? null)
      : null,
  (data) => {
    emit("resolved", data ? { ...data, avatarUrl: buildUrl.userAvatar(data.osuId) } : null);
  },
  { immediate: true },
);

const formatRank = (rank: number | null) =>
  rank === null ? "unranked" : `#${rank.toLocaleString()}`;
</script>

<template>
  <div
    class="flex items-center gap-3 rounded-md px-2 py-2"
    :class="{ 'bg-muted/50': slotNumber % 2 !== 0 }"
  >
    <span
      class="bg-primary/10 text-primary flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
    >
      {{ slotNumber }}
    </span>

    <Input v-model="raw" class="h-9 w-36 shrink-0" placeholder="osu! ID" inputmode="numeric" />
    <div class="flex min-w-0 flex-1 items-center gap-2">
      <Spinner v-if="asyncStatus === 'loading'" class="size-4" />
      <template v-else-if="osuUser.status === 'success'">
        <Avatar class="size-9">
          <AvatarImage :src="buildUrl.userAvatar(osuUser.data.osuId)" />
          <AvatarFallback>{{ osuUser.data.username[0] }}</AvatarFallback>
        </Avatar>
        <span
          :style="{
            'background-image': `url(${buildUrl.countryFlag(osuUser.data.countryCode)})`,
          }"
          class="size-6 shrink-0"
        />
        <span class="truncate text-sm font-medium">{{ osuUser.data.username }}</span>
        <span class="text-muted-foreground ml-auto shrink-0 text-xs">
          {{ formatRank(osuUser.data.osuRank) }}
        </span>
        <Icon
          v-if="isDuplicate"
          name="fa7-solid:triangle-exclamation"
          class="shrink-0 text-orange-500"
        />
      </template>
      <span v-else-if="osuUser.status === 'error'" class="text-destructive text-xs">invalid</span>
      <span v-else class="text-muted-foreground text-xs">—</span>
    </div>
  </div>
</template>
