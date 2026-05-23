<script setup lang="ts">
import { useForm } from "@tanstack/vue-form";
import * as v from "valibot";
import { createTournamentSchema } from "~~/shared/validation/tournaments";

import { isInvalid } from "../ui/field/utils";

type FormValues = v.InferOutput<typeof createTournamentSchema>;

const formId = "tournament-create-form";

const emit = defineEmits<{
  submit: [values: FormValues];
}>();

const form = useForm({
  defaultValues: {
    name: "",
    slug: "",
    acronym: "",
    type: null as FormValues["type"] | null,
    minTeamSize: null as number | null,
    maxTeamSize: null as number | null,
    lowerRankLimit: null as number | null,
    upperRankLimit: null as number | null,
  },
  validators: {
    onChange: createTournamentSchema,
  },
  onSubmit: async ({ value }) => {
    emit("submit", value as FormValues);
  },
  onSubmitInvalid: ({ value }) => {
    console.log(value);
  },
});

const isTeamTournament = computed(
  () => form.useStore((state) => state.values.type === "teams").value,
);

const isOpenRank = ref(false);
</script>

<template>
  <form :id="formId" class="space-y-3" @submit.prevent="form.handleSubmit">
    <FieldGroup>
      <form.Field v-slot="{ field }" name="name">
        <Field :data-invalid="isInvalid(field)">
          <FieldLabel :for="field.name">Tournament Name</FieldLabel>
          <Input
            required
            :id="field.name"
            :name="field.name"
            :model-value="field.state.value"
            :aria-invalid="isInvalid(field)"
            @blur="field.handleBlur"
            @input="field.handleChange($event.target.value)"
          />
          <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
        </Field>
      </form.Field>
      <form.Field v-slot="{ field }" name="acronym">
        <Field :data-invalid="isInvalid(field)">
          <FieldLabel :for="field.name">Tournament Acronym</FieldLabel>
          <Input
            required
            :id="field.name"
            :name="field.name"
            :model-value="field.state.value"
            :aria-invalid="isInvalid(field)"
            @blur="field.handleBlur"
            @input="field.handleChange($event.target.value)"
          />
          <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
        </Field>
      </form.Field>
      <form.Field v-slot="{ field }" name="slug">
        <Field :data-invalid="isInvalid(field)">
          <FieldLabel :for="field.name">URL Slug</FieldLabel>
          <FieldDescription>
            The string that will be used to navigate towards any pages related to the tournament.
          </FieldDescription>
          <Input
            required
            :id="field.name"
            :name="field.name"
            :model-value="field.state.value"
            :aria-invalid="isInvalid(field)"
            @blur="field.handleBlur"
            @input="field.handleChange($event.target.value)"
          />
          <FieldLegend variant="label" class="text-xs!">
            Example URL: http://localhost:5173/t/{{
              (field.state.value as string)?.length !== 0 ? field.state.value : "[slug]"
            }}
          </FieldLegend>
          <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
        </Field>
      </form.Field>
      <form.Field v-slot="{ field }" name="type">
        <Field :data-invalid="isInvalid(field)">
          <FieldLabel :for="field.name">Tournament Type</FieldLabel>
          <Select
            :name="field.name"
            :model-value="field.state.value"
            :aria-invalid="isInvalid(field)"
            @update:model-value="(v) => field.handleChange(v as FormValues['type'])"
          >
            <SelectTrigger :id="field.name">
              <SelectValue placeholder="---" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="teams">Team</SelectItem>
              <SelectItem value="solo">Solo</SelectItem>
            </SelectContent>
          </Select>
          <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
        </Field>
      </form.Field>
    </FieldGroup>
    <div>
      <Transition
        enter-active-class="transition-all duration-200 ease-in-out"
        enter-from-class="opacity-0 -translate-y-2 max-h-0"
        enter-to-class="opacity-100 translate-y-0 max-h-64"
        leave-active-class="transition-all duration-200 ease-in-out"
        leave-from-class="opacity-100 translate-y-0 max-h-64"
        leave-to-class="opacity-0 -translate-y-2 max-h-0"
      >
        <FieldGroup v-if="isTeamTournament" class="overflow-hidden">
          <form.Field v-slot="{ field }" name="minTeamSize">
            <Field :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name">Min Team Size</FieldLabel>
              <Input
                required
                type="number"
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value ?? undefined"
                :aria-invalid="isInvalid(field)"
                @blur="field.handleBlur"
                @input="field.handleChange($event.target.valueAsNumber)"
              />
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
          <form.Field v-slot="{ field }" name="maxTeamSize">
            <Field :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name">Max Team Size</FieldLabel>
              <Input
                required
                type="number"
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value ?? undefined"
                :aria-invalid="isInvalid(field)"
                @blur="field.handleBlur"
                @input="field.handleChange($event.target.valueAsNumber)"
              />
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
        </FieldGroup>
      </Transition>
    </div>
    <FieldGroup>
      <Field orientation="horizontal">
        <Checkbox name="checkbox" id="checkbox" class="max-w-4" v-model="isOpenRank" />
        <FieldLabel for="checkbox"> Is it open rank? </FieldLabel>
      </Field>
      <div>
        <Transition
          enter-active-class="transition-all duration-200 ease-in-out"
          enter-from-class="opacity-0 -translate-y-2 max-h-0"
          enter-to-class="opacity-100 translate-y-0 max-h-64"
          leave-active-class="transition-all duration-200 ease-in-out"
          leave-from-class="opacity-100 translate-y-0 max-h-64"
          leave-to-class="opacity-0 -translate-y-2 max-h-0"
        >
          <FieldGroup v-if="!isOpenRank" class="overflow-hidden">
            <form.Field v-slot="{ field }" name="lowerRankLimit">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name">Lower Rank Limit</FieldLabel>
                <Input
                  required
                  type="number"
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value ?? undefined"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @input="field.handleChange($event.target.valueAsNumber)"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
            <form.Field v-slot="{ field }" name="upperRankLimit">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name">Upper Rank Limit</FieldLabel>
                <FieldDescription> If not set, it'll default to infinity. </FieldDescription>
                <Input
                  required
                  type="number"
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value ?? undefined"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @input="field.handleChange($event.target.valueAsNumber)"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </FieldGroup>
        </Transition>
      </div>
    </FieldGroup>
  </form>
  <Button :form="formId" class="w-fit" type="submit">Create</Button>
</template>
