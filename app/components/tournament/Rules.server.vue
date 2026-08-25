<script setup lang="ts">
import { tournamentRulesBySlugQuery } from "~~/app/queries/tournament";

const props = defineProps<{ slug: string }>();

const { data: rules } = useQuery(() => tournamentRulesBySlugQuery({ slug: props.slug }));
</script>

<template>
  <div class="prose dark:prose-invert max-w-none">
    <Markdown v-if="rules" :value="rules" />
  </div>
</template>
