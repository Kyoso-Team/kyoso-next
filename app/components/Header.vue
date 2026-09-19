<script setup lang="ts">
import { buildUrl } from "~/lib/utils";

const { user } = useUserSession();
</script>

<template>
  <Popover>
    <header class="bg-card flex h-14.5 items-center justify-between border-b-2 px-4">
      <NuxtLink to="/" class="duration-150 hover:opacity-75">
        <KyosoLogo />
      </NuxtLink>
      <div class="flex items-center gap-2">
        <div v-if="user" class="flex items-center">
          <PopoverTrigger>
            <Avatar class="transition-transform hover:scale-105">
              <AvatarImage :src="buildUrl.userAvatar(user.osuId)" />
            </Avatar>
          </PopoverTrigger>
        </div>
      </div>
    </header>
    <ProfileMenu />
  </Popover>
</template>
