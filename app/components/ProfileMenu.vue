<script setup lang="ts">
import type { PopoverContentProps } from "reka-ui";

const { side = "bottom" } = defineProps<{
  side?: PopoverContentProps["side"];
}>();
</script>

<template>
  <PopoverContent
    align="end"
    :side="side"
    :sideOffset="15"
    class="flex w-60 flex-col items-center justify-center border-none p-1.25"
  >
    <NuxtLink to="/profile" class="w-full">
      <Button type="button" class="w-full justify-start" variant="ghost">Profile</Button>
    </NuxtLink>
    <Button as="a" href="/api/auth/logout" variant="ghost" class="w-full justify-start"
      >Log out</Button
    >
    <div class="flex w-full justify-between px-4 py-2">
      <span class="text-sm">Theme</span>
      <label class="flex gap-2" htmlFor="theme-switch">
        <Icon name="fa7-regular:moon"></Icon>
        <Switch
          :defaultValue="$colorMode.value === 'light'"
          @update:modelValue="
            (v) => (v ? ($colorMode.preference = 'light') : ($colorMode.preference = 'dark'))
          "
          id="theme-switch"
        />
        <Icon name="fa7-regular:sun"></Icon>
      </label>
    </div>
  </PopoverContent>
</template>
