<script setup lang="ts">
import { buildUrl, cn } from "~/lib/utils";

const { data: session } = useSession();
const { data: badges } = useQuery({
  key: () => ["badges", session.value!.user.osu.osuId],
  query: () =>
    $fetch("/api/badges", {
      headers: useRequestHeaders(["cookie"]),
    }),
});
</script>

<template>
  <div class="mx-auto flex size-full max-w-5xl flex-col gap-3 p-4 py-10">
    <h1 class="text-3xl">User Profile</h1>
    <Card v-if="session">
      <CardContent class="space-y-4">
        <div class="flex items-start gap-5">
          <Avatar class="size-20 rounded-md">
            <AvatarImage :src="buildUrl.userAvatar(session.user.osu.osuId)" />
          </Avatar>
          <div class="flex h-full flex-col text-xl">
            <div class="flex items-center gap-2">
              <span>{{ session.user.osu.username }}</span>
              <NuxtLink external :to="`https://osu.ppy.sh/u/${session.user.osu.osuId}`">
                <OsuIcon />
              </NuxtLink>
            </div>
            <div
              v-if="session.user.discord"
              class="text-muted-foreground flex items-center gap-1 text-xs"
            >
              <Icon name="fa7-brands:discord" />
              <span>{{ session.user.discord.username }}</span>
            </div>
            <Button as="a" href="/api/auth/discord" size="sm" variant="outline" v-else>
              <Icon name="fa7-brands:discord" />
              <span>Connect Discord</span>
            </Button>
            <div class="mt-2 flex items-center gap-1">
              <span
                :style="{
                  'background-image': `url(${buildUrl.countryFlag(session.user.osu.countryCode)})`,
                }"
                class="size-6 shrink-0"
              />
              <span class="text-sm">{{ session.user.osu.country }}</span>
            </div>
          </div>
        </div>
        <Separator />
        <div class="group flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <Checkbox id="highlightBwsEligible" />
            <label for="highlightBwsEligible" class="text-sm select-none">
              Highlight BWS eligible badges
            </label>
          </div>
          <div v-if="badges && badges.length > 0" class="flex gap-2">
            <NuxtImg
              v-for="badge in badges"
              :data-bws-eligible="badge.isBwsEligible"
              class="group-has-data-[state=checked]:data-[bws-eligible=false]:opacity-30"
              :src="buildUrl.badge(badge.imgFileName)"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
