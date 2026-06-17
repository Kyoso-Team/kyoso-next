<script setup lang="ts">
const route = useRoute("tournaments-slug-settings");

const settingsItems = [
  {
    href: `/tournaments/${route.params.slug}/settings`,
    label: "General",
  },
  {
    href: `/tournaments/${route.params.slug}/settings/players`,
    label: "Players",
  },
  {
    href: `/tournaments/${route.params.slug}/settings/stages`,
    label: "Stages",
  },
];
</script>

<template>
  <Sidebar collapsible="none" class="hidden flex-1 rounded-tr-lg rounded-br-lg md:flex">
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in settingsItems" :key="item.href">
            <SidebarMenuButton size="sm" as-child :tooltip="item.label">
              <NuxtLink :to="item.href">
                <!-- <Icon :name="item.icon" size="18" class="shrink-0" /> -->
                <span>{{ item.label }}</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>
