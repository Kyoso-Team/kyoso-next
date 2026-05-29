<script setup lang="ts">
import { useForm } from "@tanstack/vue-form";
import { diff } from "ohash/utils";
import { isInvalid } from "~~/app/components/ui/field/utils";
import {
  updateTournamentSchema,
  type Tournament,
  type UpdateTournament,
} from "~~/shared/validation/tournaments";

const DEFAULT_BWS_SETTINGS: Tournament["bwsSettings"] = {
  x: 0.9937,
  y: 2,
  z: 1,
  type: "linear",
  year: null,
};

const props = defineProps<{ tournament: UpdateTournament }>();
const emit = defineEmits<{
  submit: [values: UpdateTournament];
}>();

const tournament = toRef(props, "tournament");

const form = useForm({
  defaultValues: tournament.value,
  validators: {
    onChange: updateTournamentSchema,
  },
  onSubmit: async ({ value }) => {
    emit("submit", value);
  },
  onSubmitInvalid: ({ formApi }) => {
    console.log(formApi.getAllErrors());
  },
});

const isOpenRank = ref(
  props.tournament.lowerRankLimit === null && props.tournament.upperRankLimit === null,
);

watch(isOpenRank, (value) => {
  if (value) {
    form.setFieldValue("lowerRankLimit", null);
    form.setFieldValue("upperRankLimit", null);
  } else {
    form.resetField("lowerRankLimit");
    form.resetField("upperRankLimit");
  }
});

const tournamentType = form.useStore((state) => state.values.type);

watch(
  tournamentType,
  (type) => {
    if (type === "solo") {
      form.setFieldValue("minTeamSize", 1);
      form.setFieldValue("maxTeamSize", 1);
    } else {
      form.resetField("minTeamSize");
      form.resetField("maxTeamSize");
    }
  },
  { immediate: true },
);

const formValues = form.useStore((state) => state.values);

const isBws = computed({
  get: () => formValues.value.bwsSettings != null,
  set: (value) => {
    if (value) {
      form.setFieldValue("bwsSettings", props.tournament.bwsSettings ?? DEFAULT_BWS_SETTINGS);
    } else {
      form.setFieldValue("bwsSettings", null);
    }
  },
});

const initialSettings = computed(() => props.tournament);

const unsavedChanges = computed(() => diff(initialSettings.value, formValues.value));
const hasUnsavedChanges = computed(() => unsavedChanges.value.length !== 0);

const revertToDefault = () => {
  form.reset(props.tournament);
  isOpenRank.value =
    props.tournament.lowerRankLimit === null && props.tournament.upperRankLimit === null;
};
</script>

<template>
  <h1 class="text-2xl">General Settings</h1>
  <Card class="bg-background mt-4 flex justify-center">
    <CardContent>
      <form class="space-y-4" @submit.prevent="form.handleSubmit">
        <FieldGroup class="grid grid-cols-3 gap-3">
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
        </FieldGroup>
        <Separator />
        <FieldGroup class="grid grid-cols-3 gap-3">
          <form.Field v-slot="{ field }" name="type">
            <Field :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name">Tournament Type</FieldLabel>
              <Select
                :name="field.name"
                :model-value="field.state.value"
                :aria-invalid="isInvalid(field)"
                @update:model-value="(v) => field.handleChange(v as 'teams' | 'solo')"
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
          <form.Field v-slot="{ field }" name="minTeamSize">
            <Field :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name">Min Team Size</FieldLabel>
              <Input
                required
                type="number"
                :disabled="tournamentType === 'solo'"
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value ?? undefined"
                :aria-invalid="isInvalid(field)"
                @blur="field.handleBlur"
                @input="
                  field.handleChange(
                    Number.isNaN($event.target.valueAsNumber)
                      ? undefined
                      : $event.target.valueAsNumber,
                  )
                "
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
                :disabled="tournamentType === 'solo'"
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value ?? undefined"
                :aria-invalid="isInvalid(field)"
                @blur="field.handleBlur"
                @input="
                  field.handleChange(
                    Number.isNaN($event.target.valueAsNumber)
                      ? undefined
                      : $event.target.valueAsNumber,
                  )
                "
              />
              <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
            </Field>
          </form.Field>
        </FieldGroup>
        <Separator />
        <FieldGroup class="grid grid-cols-[100%]">
          <div class="flex items-center gap-2">
            <Checkbox name="open-rank-checkbox" id="open-rank-checkbox" v-model="isOpenRank" />
            <label for="open-rank-checkbox">Open rank?</label>
          </div>
          <div class="flex items-start gap-2">
            <form.Field
              v-slot="{ field }"
              name="lowerRankLimit"
              :validators="{
                onChange: ({ value }) => {
                  if (isOpenRank) return undefined;

                  return value === undefined ? 'Lower rank limit is required' : undefined;
                },
              }"
            >
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name">Lower Rank Limit</FieldLabel>
                <Input
                  required
                  type="number"
                  :disabled="isOpenRank"
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value ?? undefined"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @input="
                    field.handleChange(
                      Number.isNaN($event.target.valueAsNumber)
                        ? undefined
                        : $event.target.valueAsNumber,
                    )
                  "
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
            <form.Field v-slot="{ field }" name="upperRankLimit">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name">Upper Rank Limit</FieldLabel>
                <Input
                  required
                  type="number"
                  :disabled="isOpenRank"
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value ?? undefined"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @input="
                    field.handleChange(
                      Number.isNaN($event.target.valueAsNumber)
                        ? undefined
                        : $event.target.valueAsNumber,
                    )
                  "
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </div>
        </FieldGroup>
        <Separator />
        <FieldGroup class="grid grid-cols-[100%]">
          <div class="flex items-center gap-2">
            <Checkbox name="bws-checkbox" id="bws-checkbox" v-model="isBws" />
            <label for="bws-checkbox">Use BWS?</label>
          </div>
          <FieldGroup class="grid grid-cols-2 items-start gap-3">
            <form.Field v-slot="{ field }" name="bwsSettings.type">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name">BWS Formula Type</FieldLabel>
                <Select
                  :disabled="!isBws"
                  :name="field.name"
                  :model-value="field.state.value"
                  :aria-invalid="isInvalid(field)"
                  @update:model-value="(v) => field.handleChange(v as 'linear' | 'quadratic')"
                >
                  <SelectTrigger :id="field.name">
                    <SelectValue placeholder="---" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="quadratic">Quadratic</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
            <form.Field v-slot="{ field }" name="bwsSettings.year">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name">Eligible Badge Year</FieldLabel>
                <Input
                  required
                  type="number"
                  :disabled="!isBws"
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value ?? undefined"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @input="
                    field.handleChange(
                      Number.isNaN($event.target.valueAsNumber)
                        ? undefined
                        : $event.target.valueAsNumber,
                    )
                  "
                />
                <FieldDescription> Only count badges from this year and onwards. </FieldDescription>
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </FieldGroup>
          <div class="flex items-start gap-2">
            <form.Field v-slot="{ field }" name="bwsSettings.x">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name">X</FieldLabel>
                <Input
                  required
                  type="number"
                  :disabled="!isBws"
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value ?? undefined"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @input="
                    field.handleChange(
                      Number.isNaN($event.target.valueAsNumber)
                        ? undefined
                        : $event.target.valueAsNumber,
                    )
                  "
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
            <form.Field v-slot="{ field }" name="bwsSettings.y">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name">Y</FieldLabel>
                <Input
                  required
                  type="number"
                  :disabled="!isBws"
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value ?? undefined"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @input="
                    field.handleChange(
                      Number.isNaN($event.target.valueAsNumber)
                        ? undefined
                        : $event.target.valueAsNumber,
                    )
                  "
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
            <form.Field v-slot="{ field }" name="bwsSettings.z">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.name">Z</FieldLabel>
                <Input
                  required
                  type="number"
                  :disabled="!isBws"
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value ?? undefined"
                  :aria-invalid="isInvalid(field)"
                  @blur="field.handleBlur"
                  @input="
                    field.handleChange(
                      Number.isNaN($event.target.valueAsNumber)
                        ? undefined
                        : $event.target.valueAsNumber,
                    )
                  "
                />
                <FieldError v-if="isInvalid(field)" :errors="field.state.meta.errors" />
              </Field>
            </form.Field>
          </div>
          <FieldDescription>
            <TournamentBwsFormula
              v-if="isBws"
              :bwsSettings="form.useStore((state) => state.values.bwsSettings).value ?? undefined"
            />
          </FieldDescription>
        </FieldGroup>
        <div class="flex w-full items-center justify-between">
          <div class="flex items-center gap-2">
            <Button type="button" variant="destructive" @click="revertToDefault"> Reset </Button>
          </div>
          <Button type="submit" :disabled="!hasUnsavedChanges"> Save </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
