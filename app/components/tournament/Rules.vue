<script setup lang="ts">
const props = defineProps<{ slug: string }>();

const { data: rules } = useFetch(`/api/tournaments/${props.slug}/rules`, {
  key: computed(() => `tournament-${props.slug}-rules`),
});
</script>

<template>
  <div class="prose dark:prose-invert max-w-none">
    <Comark v-if="rules" :markdown="rules" />
  </div>
</template>
