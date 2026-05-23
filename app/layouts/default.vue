<script setup lang="ts">
import Header from "~/components/Header.vue";
</script>

<template>
  <Header />
  <div class="flex-1 overflow-hidden">
    <slot />
  </div>
</template>
