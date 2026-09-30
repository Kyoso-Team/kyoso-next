<script setup lang="ts">
import { kebabCase } from "scule";

import ProfileMenu from "~/components/ProfileMenu.vue";
import { SidebarGroup } from "~/components/ui/sidebar";
import { buildUrl } from "~/lib/utils";

const route = useRoute("tournaments-slug");

const { user } = useUserSession();

const { data, error: tournamentError } = useTournament();

useSeoMeta({
  ogTitle: data.value?.name,
  ogImage: data.value?.banner,
});

if (tournamentError.value) {
  console.error(tournamentError.value);
  throw createError({
    message: tournamentError.value.message,
  });
}

const items = [
  {
    href: `/tournaments/${route.params.slug}/settings`,
    label: "Settings",
    icon: "fa7-solid:cog",
  },
  {
    href: `/tournaments/${route.params.slug}/participants`,
    label: "Participants",
    icon: "fa7-solid:users",
  },
  {
    href: `/tournaments/${route.params.slug}/rounds`,
    label: "Rounds",
    icon: "fa7-solid:trophy",
  },
  {
    href: `/tournaments/${route.params.slug}/assets`,
    label: "Assets",
    icon: "fa7-solid:images",
  },
  {
    href: `/tournaments/${route.params.slug}/staff-applications`,
    label: "Staff Applications",
    icon: "fa7-solid:users",
  },
];

const isSettingsPage = computed(() => route.path.includes("/settings"));
</script>

<template>
  <div class="flex size-full flex-auto overflow-hidden">
    <SidebarProvider
      :open="true"
      :style="{
        '--sidebar-width': '175px',
      }"
    >
      <Popover>
        <Sidebar class="overflow-hidden" variant="floating" collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="sm"
                    as-child
                    tooltip="Home"
                    :is-active="route.name === 'tournaments-slug'"
                  >
                    <NuxtLink
                      :href="{ name: 'tournaments-slug', params: { slug: route.params.slug } }"
                    >
                      <Icon name="fa7-solid:house" size="18" class="shrink-0" />
                      <span>Home</span>
                    </NuxtLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem v-for="item in items" :key="item.href">
                  <SidebarMenuButton
                    size="sm"
                    as-child
                    :tooltip="item.label"
                    :is-active="route.path.endsWith(kebabCase(item.label).replace(' ', ''))"
                  >
                    <NuxtLink :to="item.href">
                      <Icon :name="item.icon ?? 'fa7-solid:question'" size="18" class="shrink-0" />
                      <span>{{ item.label }}</span>
                    </NuxtLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="sm" as-child tooltip="Back to dashboard">
                  <NuxtLink to="/dashboard">
                    <Icon name="lucide:arrow-left" size="18" class="shrink-0" />
                    <span>To dashboard</span>
                  </NuxtLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div class="flex justify-start gap-2">
              <div v-if="user" class="w-full">
                <PopoverTrigger class="w-full">
                  <Button variant="ghost" class="flex w-full justify-start pl-0.5">
                    <Avatar class="rounded-md">
                      <AvatarImage :src="buildUrl.userAvatar(Number(user.osuId))" />
                    </Avatar>
                    <span class="text-xs">{{ user.name }}</span>
                  </Button>
                </PopoverTrigger>
              </div>
            </div>
            <ProfileMenu side="right" />
          </SidebarFooter>
        </Sidebar>
        <!-- <TournamentSettingsSidebar v-if="isSettingsPage" /> -->
      </Popover>
      <SidebarInset class="h-svh p-2">
        <Card
          :class="cn('flex h-full overflow-auto', $route.name === 'tournaments-slug' && 'py-0')"
        >
          <CardContent
            :class="cn('flex size-full flex-col', $route.name === 'tournaments-slug' && 'p-0')"
          >
            <slot />
          </CardContent>
        </Card>
      </SidebarInset>
    </SidebarProvider>
  </div>
</template>
