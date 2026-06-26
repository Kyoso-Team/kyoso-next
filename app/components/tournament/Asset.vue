<script setup lang="ts">
import { capitalize } from "vue";
import { toast } from "vue-sonner";

import { cn } from "~/lib/utils";

const props = defineProps<{
  img: string | null;
  type: "logo" | "banner";
}>();

const route = useRoute("tournaments-slug");

const { setModal } = useModal();
const { refresh } = useTournament(route.params.slug);

const { uploadFile, uploading } = useS3Upload();

const handleSubmit = async (files: FileList) => {
  const file = files[0];
  if (!file) return;

  await uploadFile(file, props.type)
    .then(async () => {
      toast.success("Asset uploaded successfully");
      await refresh();
    })
    .catch(() => {
      toast.error("Failed to upload asset");
    });
};
</script>

<template>
  <AlertDialog>
    <Card
      :class="
        cn('bg-background flex h-full max-h-80 w-full', type === 'logo' ? 'max-w-72' : 'max-w-132')
      "
    >
      <CardHeader class="flex justify-between">
        <h1 class="text-2xl">{{ capitalize(type) }}</h1>
        <div>
          <AlertDialogTrigger>
            <Button :disabled="uploading" size="icon" class="rounded-full">
              <Icon v-if="!uploading" name="fa7-solid:upload" size="24" />
              <Spinner v-else />
            </Button>
          </AlertDialogTrigger>
        </div>
      </CardHeader>
      <CardContent class="flex justify-center">
        <div
          class="h-48 rounded-md"
          :style="{
            aspectRatio: type === 'logo' ? '1/1' : '21/9',
          }"
        >
          <NuxtImg v-if="img" :src="img" class="h-full w-full object-cover" />
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

    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle class="text-2xl">Upload {{ capitalize(type) }}</AlertDialogTitle>
      </AlertDialogHeader>
      <TournamentAssetUploadForm @submitImage="handleSubmit" :img="img" :type="type" />
    </AlertDialogContent>
  </AlertDialog>
</template>
