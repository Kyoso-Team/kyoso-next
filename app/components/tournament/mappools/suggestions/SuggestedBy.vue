<script setup lang="ts">
import { buildUrl } from "~/lib/utils";

defineProps<{
  osuId: number;
  username: string;
}>();
</script>

<template>
  <div class="flex items-center gap-2">
    <Avatar class="size-7">
      <AvatarImage :src="buildUrl.userAvatar(osuId)" alt="avatar" />
    </Avatar>
    <span class="text-xs">{{ username }}</span>
  </div>
</template>
