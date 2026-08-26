<script setup lang="ts">
import { useForm, Form, Field as FormField, type SubmitHandler } from "@formisch/vue";
import { titleCase } from "scule";
import {
  TOURNAMENT_LINK_TYPES,
  tournamentLinkItemSchema,
  type TournamentLink,
} from "~~/shared/validation/tournament-links";

import { isInvalid } from "~/components/ui/field/utils";

const emits = defineEmits<{
  submit: [values: TournamentLink];
}>();

const form = useForm({
  schema: tournamentLinkItemSchema,
  validate: "blur",
  revalidate: "input",
});

const submit: SubmitHandler<typeof tournamentLinkItemSchema> = async (values) => {
  emits("submit", values);
};
</script>

<template>
  <Form :of="form" class="space-y-4" @submit="submit">
    <FieldGroup>
      <FormField :of="form" :path="['label']" v-slot="field">
        <Field :data-invalid="isInvalid(field)">
          <FieldContent>
            <FieldLabel required :for="field.props.name">Label</FieldLabel>
            <FieldDescription> What is this date for? </FieldDescription>
          </FieldContent>
          <Input
            required
            type="text"
            :id="field.props.name"
            v-model="field.input"
            v-bind="field.props"
            :aria-invalid="isInvalid(field)"
          />
          <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
        </Field>
      </FormField>
      <FormField :of="form" :path="['url']" v-slot="field">
        <Field :data-invalid="isInvalid(field)">
          <FieldContent>
            <FieldLabel required :for="field.props.name">URL</FieldLabel>
          </FieldContent>
          <Input
            required
            type="text"
            :id="field.props.name"
            v-model="field.input"
            v-bind="field.props"
            :aria-invalid="isInvalid(field)"
          />
          <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
        </Field>
      </FormField>
      <FormField :of="form" :path="['type']" v-slot="field">
        <Field :data-invalid="isInvalid(field)">
          <FieldLabel :for="field.props.name">Type</FieldLabel>
          <Select :id="field.props.name" v-model="field.input" v-bind="field.props">
            <SelectTrigger :aria-invalid="isInvalid(field)" :id="field.props.name">
              <SelectValue placeholder="---" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="label in TOURNAMENT_LINK_TYPES" :key="label" :value="label">
                {{ titleCase(label) }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
        </Field>
      </FormField>
    </FieldGroup>
    <Button class="w-fit" type="submit">Add</Button>
  </Form>
</template>
