<script setup lang="ts">
import { Form, Field as FormField, useForm, type SubmitHandler } from "@formisch/vue";
import * as v from "valibot";
import { createTournamentSchema } from "~~/shared/validation/tournaments";

import { isInvalid } from "../ui/field/utils";

type FormValues = v.InferOutput<typeof createTournamentSchema>;

const emit = defineEmits<{
  submit: [values: FormValues];
}>();

const form = useForm({
  schema: createTournamentSchema,
  validate: "blur",
  revalidate: "input",
});

const submitForm: SubmitHandler<typeof createTournamentSchema> = (values) => {
  emit("submit", values);
};

// const slug = useField(form, {
//   path: ["slug"],
// });

// const checkSlug = useDebounceFn(async (slug: string) => {
//   const slugExists = await $fetch("/api/tournaments/check-slug", {
//     query: { slug },
//   });
//   return slugExists ? "This slug is already taken" : undefined;
// }, 500);

// watchEffect(async () => {
//   if (slug.input) {
//     const error = await checkSlug(slug.input);
//     if (error) {
//       setErrors(form, { path: ["slug"], errors: [error] });
//     }
//   }
// });
</script>

<template>
  <Form :of="form" class="space-y-3" @submit="submitForm">
    <FieldGroup>
      <FormField :of="form" :path="['name']" v-slot="field">
        <Field :data-invalid="isInvalid(field)">
          <FieldLabel :for="field.props.name">Tournament Name</FieldLabel>
          <Input
            required
            :id="field.props.name"
            v-model="field.input"
            v-bind="field.props"
            :aria-invalid="isInvalid(field)"
          />
          <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
        </Field>
      </FormField>
      <FormField :of="form" :path="['acronym']" v-slot="field">
        <Field :data-invalid="isInvalid(field)">
          <FieldLabel :for="field.props.name">Tournament Acronym</FieldLabel>
          <Input
            required
            :id="field.props.name"
            v-model="field.input"
            v-bind="field.props"
            :aria-invalid="isInvalid(field)"
          />
          <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
        </Field>
      </FormField>
      <FormField :of="form" :path="['slug']" v-slot="field">
        <Field :data-invalid="isInvalid(field)">
          <FieldContent>
            <FieldLabel :for="field.props.name">URL Slug</FieldLabel>
            <FieldDescription>
              The string that will be used to navigate towards any pages related to the tournament.
            </FieldDescription>
          </FieldContent>
          <Input
            required
            v-model="field.input"
            v-bind="field.props"
            :id="field.props.name"
            :aria-invalid="isInvalid(field)"
          />
          <FieldLegend variant="label" class="text-xs!">
            Example URL: http://localhost:5173/{{
              field.input?.length !== 0 ? field.input : "[slug]"
            }}
          </FieldLegend>
          <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
        </Field>
      </FormField>
    </FieldGroup>
    <Button class="w-fit" type="submit">Create</Button>
  </Form>
</template>
