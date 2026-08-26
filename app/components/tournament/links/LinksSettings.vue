<script setup lang="ts">
import {
  useForm,
  Form,
  FieldArray,
  Field as FormField,
  insert,
  useFieldArray,
  type SubmitHandler,
  reset,
  getInput,
  pickDirty,
} from "@formisch/vue";
import { toast } from "vue-sonner";
import { tournamentLinkSchema, type TournamentLink } from "~~/shared/validation/tournament-links";

import { typeIconMap } from "~/lib/links";
import { tournamentBySlugQuery } from "~/queries/tournament";

import CreateLinkForm from "./CreateLinkForm.vue";

const props = defineProps<{ links: TournamentLink[] }>();
const links = toRef(props.links);

const { params } = useRoute("tournaments-slug");
const queryCache = useQueryCache();

const { mutate: updateLinks } = useMutation({
  mutation: async (values: TournamentLink[]) => {
    await $fetch(`/api/tournaments/${params.slug}`, {
      // @ts-expect-error
      method: "PATCH",
      body: {
        links: values,
      },
      headers: useRequestHeaders(["cookie"]),
    });
  },
  onSuccess: () => {
    toast.success("Links updated successfully.");
    queryCache.invalidateQueries({
      key: tournamentBySlugQuery({ slug: params.slug }).key,
    });
    reset(form, { initialInput: getInput(form) });
  },
});

const form = useForm({
  schema: tournamentLinkSchema,
  initialInput: {
    links: links.value,
  },
});
const submit: SubmitHandler<typeof tournamentLinkSchema> = async (values) => {
  const dirty = pickDirty(form, { from: values });
  if (dirty) {
    updateLinks(values.links);
  }
};
const linksArray = useFieldArray(form, { path: ["links"] });

const linksList = useTemplateRef("linksListRef");

const modalOpen = ref(false);
const handleAddLink = (link: TournamentLink) => {
  insert(form, { path: ["links"], initialInput: link });
  modalOpen.value = false;
};
</script>

<template>
  <Dialog v-model:open="modalOpen">
    <div>
      <h1 class="text-2xl">Links</h1>
      <Card ref="linksListRef" class="bg-background mt-4 flex w-full max-w-5xl justify-center">
        <CardContent>
          <Form :of="form" @submit="submit" class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <FieldArray :of="form" :path="['links']" v-slot="fieldArray">
                <div
                  v-if="fieldArray.items.length === 0"
                  class="bg-card text-muted-foreground w-full rounded-md p-4"
                >
                  No links configured
                </div>
                <div
                  v-else
                  v-for="(item, index) in linksArray.items"
                  class="bg-card flex gap-2 rounded-md p-3"
                  :key="item"
                >
                  <FormField :of="form" :path="['links', index]" v-slot="link">
                    <div class="flex items-center gap-4">
                      <Icon :name="typeIconMap[link.input.type ?? 'other']" size="32" />
                      <div class="flex flex-col gap-1">
                        <div>{{ link.input.label ?? "" }}</div>
                        <NuxtLink :to="link.input.url ?? ''" external>
                          <span class="text-muted-foreground text-sm underline">{{
                            link.input.url ?? ""
                          }}</span>
                        </NuxtLink>
                      </div>
                    </div>
                  </FormField>
                </div>
              </FieldArray>
            </div>

            <div class="flex w-full items-center justify-between">
              <div class="flex items-center gap-2">
                <Button type="button" variant="destructive"> Reset </Button>
                <!-- <Alert class="bg-accent transition duration-300">
                  <AlertDescription class="flex items-center gap-2">
                    <Icon name="fa7-solid:triangle-exclamation" size="16" />
                    You have unsaved changes
                  </AlertDescription>
                </Alert> -->
              </div>
              <div class="flex gap-2">
                <Button type="button" variant="secondary" @click="modalOpen = true"> Add </Button>
                <Button type="submit"> Save </Button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add link</DialogTitle>
        </DialogHeader>
        <CreateLinkForm @submit="handleAddLink" />
      </DialogContent>
    </div>
  </Dialog>
</template>
