<script setup lang="ts">
import { useFileDialog } from "@vueuse/core";

const props = defineProps<{ img: string | null; type: "logo" | "banner" }>();
const emit = defineEmits<{ submitImage: [FileList] }>();

const { files, open, reset } = useFileDialog({
  multiple: false,
  accept: "image/*",
});

const previewUrl = ref<string | null>(props.img);
watchEffect((onCleanup) => {
  const file = files.value?.[0];
  if (file) {
    const url = URL.createObjectURL(file);
    previewUrl.value = url;
    onCleanup(() => URL.revokeObjectURL(url));
  } else {
    previewUrl.value = props.img;
  }
});

onBeforeUnmount(() => {
  if (previewUrl.value) {
    reset();
  }
});
</script>

<template>
  <div class="space-y-1">
    <p>
      <span class="font-bold">Aspect ratio: </span>
      {{ type === "logo" ? "1:1" : "21:9" }}
    </p>
    <p>
      <span class="font-bold">Dimensions: </span>
      {{ type === "logo" ? "250x250" : "1600x685" }} (or greater)
    </p>
    <p v-if="type === 'logo'" class="text-sm italic">
      An image with a transparent background is preferred.
    </p>
  </div>
  <div class="flex min-w-0 items-center gap-2 rounded-md border p-2">
    <Button @click="open"> Select file </Button>
    <div class="min-w-0 flex-1">
      <span class="block truncate">
        {{ files?.[0]?.name || "No file selected" }}
      </span>
    </div>
  </div>
  <div class="flex w-full items-center justify-center">
    <div
      class="bg-muted h-48 overflow-hidden rounded-md"
      :style="{
        aspectRatio: type === 'logo' ? '1/1' : '21/9',
      }"
    >
      <NuxtImg v-if="previewUrl" :src="previewUrl" class="h-full w-full object-contain" />
      <Empty class="bg-card size-full select-none" v-else>
        <EmptyHeader>
          <EmptyMedia>
            <Icon name="lucide:image-off" size="48" />
          </EmptyMedia>
          <EmptyDescription>No image has been uploaded</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  </div>
  <AlertDialogFooter class="flex justify-start!">
    <Button :disabled="!previewUrl" @click="emit('submitImage', files!)">Upload</Button>
    <AlertDialogCancel> Close </AlertDialogCancel>
  </AlertDialogFooter>
</template>
