<script setup lang="ts">
import { capitalize } from "vue";

import { cn } from "~/lib/utils";

defineProps<{
  img: string | null;
  type: "logo" | "banner";
}>();
</script>

<template>
  <Card
    :class="
      cn('bg-background flex h-full max-h-80 w-full', type === 'logo' ? 'max-w-72' : 'max-w-132')
    "
  >
    <CardHeader>
      <h1 class="text-2xl">{{ capitalize(type) }}</h1>
    </CardHeader>
    <CardContent class="flex justify-center">
      <div
        class="h-48"
        :style="{
          aspectRatio: type === 'logo' ? '1/1' : '21/9',
        }"
      >
        <img v-if="img" :src="img" class="h-full w-full object-cover" />
        <Empty class="bg-card size-full select-none" v-else>
          <EmptyHeader>
            <EmptyMedia>
              <Icon name="lucide:image-off" size="48" />
            </EmptyMedia>
            <EmptyDescription>No image has been uploaded</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </CardContent>
  </Card>
</template>
