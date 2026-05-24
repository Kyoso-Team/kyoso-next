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

const defaultValues: v.InferInput<typeof createTournamentSchema> = {
  name: "",
  slug: "",
  acronym: "",
  type: undefined,
  minTeamSize: undefined,
  maxTeamSize: undefined,
  lowerRankLimit: undefined,
  upperRankLimit: undefined,
};

const form = useForm({
  defaultValues,
  validators: {
    onChange: createTournamentSchema,
  },
  onSubmit: async ({ value }) => {
    emit("submit", value as FormValues);
  },
  onSubmitInvalid: import.meta.env.DEV
    ? ({ value, formApi }) => {
        console.log(value);
        console.log(formApi.getAllErrors());
      }
    : undefined,
});

const checkSlug = async (slug: string) => {
  const slugExists = await $fetch("/api/tournaments/check-slug", {
    query: { slug },
  });
  return slugExists ? "This slug is already taken" : undefined;
};

const isTeamTournament = computed(
  () => form.useStore((state) => state.values.type).value === "teams",
);

const isOpenRank = ref(false);

watch(
  isTeamTournament,
  (isTeam) => {
    if (!isTeam) {
      form.setFieldValue("minTeamSize", 1, { dontValidate: true });
      form.setFieldValue("maxTeamSize", 1, { dontValidate: true });
    } else {
      form.setFieldValue("minTeamSize", undefined, { dontValidate: true });
      form.setFieldValue("maxTeamSize", undefined, { dontValidate: true });
    }
  },
  { immediate: true },
);

watch(
  isOpenRank,
  (isOpenRank) => {
    if (isOpenRank) {
      form.setFieldValue("lowerRankLimit", null, { dontValidate: true });
      form.setFieldValue("upperRankLimit", null, { dontValidate: true });
    }
  },
  { immediate: true },
);
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
      <form.Field
        v-slot="{ field }"
        name="slug"
        :validators="{
          onChangeAsync: async ({ value }) => {
            const slugExists = await checkSlug(value);
            return slugExists ? 'This slug is already taken' : undefined;
          },
          onChangeAsyncDebounceMs: 500,
        }"
      >
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
              field.state.value.length !== 0 ? field.state.value : "[slug]"
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
    <form.Field v-slot="{ field: minTeamSizeField }" name="minTeamSize">
      <form.Field v-slot="{ field: maxTeamSizeField }" name="maxTeamSize">
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
              <Field :data-invalid="isInvalid(minTeamSizeField)">
                <FieldLabel :for="minTeamSizeField.name">Min Team Size</FieldLabel>
                <Input
                  required
                  type="number"
                  :id="minTeamSizeField.name"
                  :name="minTeamSizeField.name"
                  :model-value="minTeamSizeField.state.value ?? undefined"
                  :aria-invalid="isInvalid(minTeamSizeField)"
                  @blur="minTeamSizeField.handleBlur"
                  @input="minTeamSizeField.handleChange($event.target.valueAsNumber)"
                />
                <FieldError
                  v-if="isInvalid(minTeamSizeField)"
                  :errors="minTeamSizeField.state.meta.errors"
                />
              </Field>
              <Field :data-invalid="isInvalid(maxTeamSizeField)">
                <FieldLabel :for="maxTeamSizeField.name">Max Team Size</FieldLabel>
                <Input
                  required
                  type="number"
                  :id="maxTeamSizeField.name"
                  :name="maxTeamSizeField.name"
                  :model-value="maxTeamSizeField.state.value ?? undefined"
                  :aria-invalid="isInvalid(maxTeamSizeField)"
                  @blur="maxTeamSizeField.handleBlur"
                  @input="maxTeamSizeField.handleChange($event.target.valueAsNumber)"
                />
                <FieldError
                  v-if="isInvalid(maxTeamSizeField)"
                  :errors="maxTeamSizeField.state.meta.errors"
                />
              </Field>
            </FieldGroup>
          </Transition>
        </div>
      </form.Field>
    </form.Field>
    <FieldGroup>
      <Field orientation="horizontal">
        <Checkbox name="checkbox" id="checkbox" class="max-w-4" v-model="isOpenRank" />
        <FieldLabel for="checkbox"> Is it open rank? </FieldLabel>
      </Field>
      <form.Field v-slot="{ field: lowerRankLimitField }" name="lowerRankLimit">
        <form.Field v-slot="{ field: upperRankLimitField }" name="upperRankLimit">
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
                <Field :data-invalid="isInvalid(lowerRankLimitField)">
                  <FieldLabel :for="lowerRankLimitField.name">Lower Rank Limit</FieldLabel>
                  <Input
                    required
                    type="number"
                    :id="lowerRankLimitField.name"
                    :name="lowerRankLimitField.name"
                    :model-value="lowerRankLimitField.state.value ?? undefined"
                    :aria-invalid="isInvalid(lowerRankLimitField)"
                    @blur="lowerRankLimitField.handleBlur"
                    @input="lowerRankLimitField.handleChange($event.target.valueAsNumber)"
                  />
                  <FieldError
                    v-if="isInvalid(lowerRankLimitField)"
                    :errors="lowerRankLimitField.state.meta.errors"
                  />
                </Field>
                <Field :data-invalid="isInvalid(upperRankLimitField)">
                  <FieldLabel :for="upperRankLimitField.name">Upper Rank Limit</FieldLabel>
                  <FieldDescription> If not set, it'll default to infinity. </FieldDescription>
                  <Input
                    type="number"
                    :id="upperRankLimitField.name"
                    :name="upperRankLimitField.name"
                    :model-value="upperRankLimitField.state.value ?? undefined"
                    :aria-invalid="isInvalid(upperRankLimitField)"
                    @blur="upperRankLimitField.handleBlur"
                    @input="upperRankLimitField.handleChange($event.target.valueAsNumber)"
                  />
                  <FieldError
                    v-if="isInvalid(upperRankLimitField)"
                    :errors="upperRankLimitField.state.meta.errors"
                  />
                </Field>
              </FieldGroup>
            </Transition>
          </div>
        </form.Field>
      </form.Field>
    </FieldGroup>
  </form>
  <Button :form="formId" class="w-fit" type="submit">Create</Button>
</template>
