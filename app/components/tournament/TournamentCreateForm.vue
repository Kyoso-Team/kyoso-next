<script setup lang="ts">
import {
  Form,
  Field as FormField,
  setErrors,
  setInput,
  useField,
  useForm,
  validate,
  type SubmitHandler,
} from "@formisch/vue";
import { useDebounceFn } from "@vueuse/core";
import * as v from "valibot";
import { createTournamentSchema } from "~~/shared/validation/tournaments";

import { isInvalid } from "../ui/field/utils";

type FormValues = v.InferOutput<typeof createTournamentSchema>;

const formId = "tournament-create-form";

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

const tournamentType = useField(form, {
  path: ["type"],
});

const isTeamTournament = computed(() => tournamentType.input === "teams");

const isOpenRank = ref(false);

watch(
  isTeamTournament,
  (isTeam) => {
    if (!isTeam) {
      setInput(form, { path: ["minTeamSize"], input: 1 });
      setInput(form, { path: ["maxTeamSize"], input: 1 });
    } else {
      setInput(form, { path: ["minTeamSize"], input: undefined });
      setInput(form, { path: ["maxTeamSize"], input: undefined });
    }
  },
  { immediate: true },
);

watch(
  isOpenRank,
  (isOpenRank) => {
    if (isOpenRank) {
      setInput(form, { path: ["lowerRankLimit"], input: undefined });
      setInput(form, { path: ["upperRankLimit"], input: undefined });
    }
  },
  { immediate: true },
);

const slug = useField(form, {
  path: ["slug"],
});

const checkSlug = useDebounceFn(async (slug: string) => {
  const slugExists = await $fetch("/api/tournaments/check-slug", {
    query: { slug },
  });
  return slugExists ? "This slug is already taken" : undefined;
}, 500);

watchEffect(async () => {
  if (slug.input) {
    const error = await checkSlug(slug.input);
    if (error) {
      setErrors(form, { path: ["slug"], errors: [error] });
    }
  }
});
</script>

<template>
  <Form :of="form" :id="formId" class="space-y-3" @submit="submitForm">
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
          <FieldLabel :for="field.props.name">URL Slug</FieldLabel>
          <FieldDescription>
            The string that will be used to navigate towards any pages related to the tournament.
          </FieldDescription>
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
      <FormField :of="form" :path="['type']" v-slot="field">
        <Field :data-invalid="isInvalid(field)">
          <FieldLabel :for="field.props.name">Tournament Type</FieldLabel>
          <Select v-model="field.input" :aria-invalid="isInvalid(field)" v-bind="field.props">
            <SelectTrigger :id="field.props.name">
              <SelectValue placeholder="---" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="teams">Team</SelectItem>
              <SelectItem value="solo">Solo</SelectItem>
            </SelectContent>
          </Select>
          <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
        </Field>
      </FormField>
    </FieldGroup>
    <FormField :of="form" :path="['minTeamSize']" v-slot="minTeamSizeField">
      <FormField :of="form" :path="['maxTeamSize']" v-slot="maxTeamSizeField">
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
                <FieldLabel :for="minTeamSizeField.props.name">Min Team Size</FieldLabel>
                <Input
                  required
                  type="number"
                  v-bind="minTeamSizeField.props"
                  :id="minTeamSizeField.props.name"
                  :name="minTeamSizeField.props.name"
                  v-model.number="minTeamSizeField.input"
                  :aria-invalid="isInvalid(minTeamSizeField)"
                />
                <FieldError
                  v-if="isInvalid(minTeamSizeField)"
                  :errors="minTeamSizeField.errors ?? []"
                />
              </Field>
              <Field :data-invalid="isInvalid(maxTeamSizeField)">
                <FieldLabel :for="maxTeamSizeField.props.name">Max Team Size</FieldLabel>
                <Input
                  required
                  type="number"
                  :id="maxTeamSizeField.props.name"
                  v-model.number="maxTeamSizeField.input"
                  :aria-invalid="isInvalid(maxTeamSizeField)"
                  v-bind="maxTeamSizeField.props"
                />
                <FieldError
                  v-if="isInvalid(maxTeamSizeField)"
                  :errors="maxTeamSizeField.errors ?? []"
                />
              </Field>
            </FieldGroup>
          </Transition>
        </div>
      </FormField>
    </FormField>
    <FieldGroup>
      <Field orientation="horizontal">
        <Checkbox name="checkbox" id="checkbox" class="max-w-4" v-model="isOpenRank" />
        <FieldLabel for="checkbox"> Is it open rank? </FieldLabel>
      </Field>
      <FormField :of="form" :path="['lowerRankLimit']" v-slot="lowerRankLimitField">
        <FormField :of="form" :path="['upperRankLimit']" v-slot="upperRankLimitField">
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
                  <FieldLabel :for="lowerRankLimitField.props.name">Lower Rank Limit</FieldLabel>
                  <Input
                    required
                    type="number"
                    :id="lowerRankLimitField.props.name"
                    v-model.number="lowerRankLimitField.input"
                    v-bind="lowerRankLimitField.props"
                    :aria-invalid="isInvalid(lowerRankLimitField)"
                  />
                  <FieldError
                    v-if="isInvalid(lowerRankLimitField)"
                    :errors="lowerRankLimitField.errors ?? []"
                  />
                </Field>
                <Field :data-invalid="isInvalid(upperRankLimitField)">
                  <FieldLabel :for="upperRankLimitField.props.name">Upper Rank Limit</FieldLabel>
                  <FieldDescription> If not set, it'll default to infinity. </FieldDescription>
                  <Input
                    type="number"
                    :id="upperRankLimitField.props.name"
                    v-model.number="upperRankLimitField.input"
                    :aria-invalid="isInvalid(upperRankLimitField)"
                    v-bind="upperRankLimitField.props"
                  />
                  <FieldError
                    v-if="isInvalid(upperRankLimitField)"
                    :errors="upperRankLimitField.errors ?? []"
                  />
                </Field>
              </FieldGroup>
            </Transition>
          </div>
        </FormField>
      </FormField>
    </FieldGroup>
    <Button :form="formId" class="w-fit" type="submit">Create</Button>
  </Form>
</template>
