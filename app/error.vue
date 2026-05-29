<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{ error: NuxtError }>();
</script>

<template>
  <NuxtLayout name="default">
    <div class="flex h-full flex-col">
      <div class="flex h-full flex-col items-center justify-center gap-4">
        <h1 class="text-5xl tracking-tight">{{ error.status }} {{ error.message }}</h1>
        <NuxtLink to="/">Go back home</NuxtLink>
      </div>
    </div>
  </NuxtLayout>
</template>
