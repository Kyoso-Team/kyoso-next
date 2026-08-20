<script setup lang="ts">
import { useForm, Form, Field as FormField, type SubmitHandler, useField } from "@formisch/vue";
import {
  tournamentDateCreateSchema,
  type TournamentDateCreate,
} from "~~/shared/validation/tournament-dates";

import { isInvalid } from "~/components/ui/field/utils";

const emits = defineEmits<{
  submit: [values: TournamentDateCreate];
}>();

const form = useForm({
  schema: tournamentDateCreateSchema,
  validate: "blur",
  revalidate: "input",
});

const startDate = useField(form, {
  path: ["startDate"],
});

const submit: SubmitHandler<typeof tournamentDateCreateSchema> = async (values) => {
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
      <FormField :of="form" :path="['type']" v-slot="field">
        <Field :data-invalid="isInvalid(field)">
          <FieldLabel :for="field.props.name">Type</FieldLabel>
          <Select :id="field.props.name" v-model="field.input" v-bind="field.props">
            <SelectTrigger :id="field.props.name">
              <SelectValue placeholder="---" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stage">Stage</SelectItem>
              <SelectItem value="screening">Screening</SelectItem>
              <SelectItem value="showmatch">Showmatch</SelectItem>
              <SelectItem value="holiday">Holiday</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
        </Field>
      </FormField>
      <FormField :of="form" :path="['startDate']" v-slot="field">
        <Field :data-invalid="isInvalid(field)">
          <FieldLabel :for="field.props.name">Start</FieldLabel>
          <Input
            required
            type="date"
            :id="field.props.name"
            v-model="field.input"
            v-bind="field.props"
            :aria-invalid="isInvalid(field)"
          />
          <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
        </Field>
      </FormField>
      <FormField :of="form" :path="['endDate']" v-slot="field">
        <Field :data-invalid="isInvalid(field)">
          <FieldLabel :for="field.props.name">End</FieldLabel>
          <Input
            required
            type="date"
            :id="field.props.name"
            v-model="field.input"
            v-bind="field.props"
            :aria-invalid="isInvalid(field)"
            :disabled="!startDate.input"
            :min="startDate.input"
          />
          <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
        </Field>
      </FormField>
    </FieldGroup>
    <Button class="w-fit" type="submit">Add</Button>
  </Form>
</template>
