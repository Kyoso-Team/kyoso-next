<script setup lang="ts">
import ProfileMenu from "~/components/ProfileMenu.vue";
import { buildUrl } from "~/lib/utils";

const route = useRoute("slug-manage");

const { data: session } = await useSession();

const { error: tournamentError } = await useTournament(route.params.slug);

if (tournamentError.value) {
  throw createError({
    status: tournamentError.value.statusCode,
    message: tournamentError.value.data?.message ?? tournamentError.value.message,
  });
}

const items = [
  {
    href: `/${route.params.slug}/manage`,
    label: "Home",
    icon: "fa7-solid:house",
  },
  {
    href: `/${route.params.slug}/manage/general`,
    label: "Settings",
    icon: "fa7-solid:cog",
  },
  {
    href: `/${route.params.slug}/manage/assets`,
    label: "Assets",
    icon: "fa7-solid:images",
  },
];

const isSettingsPage = computed(() => route.path.includes("/general"));
</script>

<template>
  <div class="flex size-full flex-auto overflow-hidden">
    <SidebarProvider
      :open="isSettingsPage"
      :style="{
        '--sidebar-width': '200px',
      }"
    >
      <Popover>
        <Sidebar
          class="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
          variant="floating"
          collapsible="icon"
        >
          <Sidebar
            collapsible="none"
            :class="[
              'w-[calc(var(--sidebar-width-icon)+1px)]! rounded-lg border-r',
              isSettingsPage ? 'rounded-tr-none rounded-br-none' : '',
            ]"
          >
            <SidebarHeader> </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarMenu>
                  <SidebarMenuItem v-for="item in items" :key="item.href">
                    <SidebarMenuButton size="sm" as-child :tooltip="item.label">
                      <NuxtLink :to="item.href">
                        <Icon :name="item.icon" size="18" class="shrink-0" />
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
                      <span>Back</span>
                    </NuxtLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              <div class="flex items-center gap-2">
                <div v-if="session" class="flex items-center">
                  <PopoverTrigger>
                    <Avatar class="rounded-md transition-transform hover:scale-105">
                      <AvatarImage :src="buildUrl.userAvatar(session.user.osu.osuId)" />
                    </Avatar>
                  </PopoverTrigger>
                </div>
              </div>
            </SidebarFooter>
            <ProfileMenu side="right" />
          </Sidebar>
          <TournamentSettingsSidebar v-if="isSettingsPage" />
        </Sidebar>
      </Popover>
      <SidebarInset class="h-svh p-2">
        <Card class="flex h-full overflow-auto">
          <CardContent class="w-full max-w-5xl">
            <slot />
          </CardContent>
        </Card>
      </SidebarInset>
    </SidebarProvider>
  </div>
</template>
