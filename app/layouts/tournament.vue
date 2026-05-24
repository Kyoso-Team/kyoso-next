<script setup lang="ts">
import ProfileMenu from "~/components/ProfileMenu.vue";
import { buildUrl } from "~/lib/utils";

const { data: session } = await useSession();

const route = useRoute("slug-manage");

const items = [
  {
    href: `/${route.params.slug}/manage`,
    label: "Home",
    icon: "fa7-solid:house",
  },
  {
    href: `/${route.params.slug}/manage/settings`,
    label: "Settings",
    icon: "fa7-solid:cog",
  },
  {
    href: `/${route.params.slug}/manage/assets`,
    label: "Assets",
    icon: "fa7-regular:images",
  },
];
</script>

<template>
  <div class="flex h-full w-full flex-auto overflow-hidden">
    <SidebarProvider :defaultOpen="false">
      <Popover>
        <Sidebar variant="floating" collapsible="icon">
          <SidebarHeader></SidebarHeader>
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
      </Popover>
      <SidebarInset class="h-svh p-2">
        <Card class="h-full">
          <template #header>
            <CardHeader>
              <CardTitle>
                <slot name="header" />
              </CardTitle>
            </CardHeader>
          </template>
          <CardContent>
            <slot />
          </CardContent>
        </Card>
      </SidebarInset>
    </SidebarProvider>
  </div>
</template>
