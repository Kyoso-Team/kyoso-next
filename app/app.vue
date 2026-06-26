<script setup lang="ts">
import "vue-sonner/style.css";

const { modal, setModal } = useModal();

useHead({
  link: [
    {
      rel: "shortcut icon",
      type: "image/x-icon",
      href: "/favicon.svg",
    },
    {
      rel: "icon",
      type: "image/x-icon",
      href: "/favicon.svg",
    },
  ],
  htmlAttrs: {
    lang: "en",
  },
});

useSeoMeta({
  title: "Kyoso",
  description: "osu! tournament management beyond spreadsheets",
  ogTitle: "Kyoso",
  ogDescription: "Host osu! tournaments without pain points of managing spreadsheets",
  ogImage: "/main-banner.png",
});
</script>

<template>
  <div class="flex h-dvh flex-col">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <Dialog :open="modal !== null" @update:open="(v) => !v && setModal(null)">
      <DialogScrollContent>
        <component v-if="modal" :is="modal" />
      </DialogScrollContent>
    </Dialog>
    <Toaster richColors position="bottom-right" class="pointer-events-auto" />
  </div>
</template>

<style>
html {
  font-family: Rubik, sans-serif;
  font-size: 16px;
}
</style>
