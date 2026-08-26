<script setup lang="ts">
import {
  useForm,
  setInput,
  reset,
  useField,
  getInput,
  Form,
  Field as FormField,
  type SubmitHandler,
  pickDirty,
  getDirtyInput,
} from "@formisch/vue";
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
  schema: updateTournamentSchema,
  initialInput: tournament.value,
  validate: "input",
});

const submitForm: SubmitHandler<typeof updateTournamentSchema> = (values) => {
  const dirty = pickDirty(form, { from: values });
  if (dirty) {
    emit("submit", {
      ...dirty,
      links: undefined,
      bwsSettings: dirty.bwsSettings ? values.bwsSettings : undefined,
    });
    reset(form, {
      initialInput: values,
    });
  }
};

const isOpenRank = useField(form, {
  path: ["isOpenRank"],
});

watch(
  () => isOpenRank.input,
  (value) => {
    if (value) {
      setInput(form, { input: null, path: ["lowerRankLimit"] });
      setInput(form, { input: null, path: ["upperRankLimit"] });
    }
  },
);

const bwsSettings = useField(form, {
  path: ["bwsSettings"],
});

const tournamentType = useField(form, {
  path: ["type"],
});

const isTeamTournament = computed(() => tournamentType.input === "teams");

watch(
  () => tournamentType.input,
  (type) => {
    if (type && type !== "teams") {
      setInput(form, { input: null, path: ["minTeamSize"] });
      setInput(form, { input: null, path: ["maxTeamSize"] });
    } else {
      reset(form, { path: ["minTeamSize"] });
      reset(form, { path: ["maxTeamSize"] });
    }
  },
  { immediate: true },
);

const isBws = computed({
  get: () => getInput(form, { path: ["bwsSettings"] }) != null,
  set: (value) => {
    if (value) {
      setInput(form, {
        input: props.tournament.bwsSettings ?? DEFAULT_BWS_SETTINGS,
        path: ["bwsSettings"],
      });
    } else {
      setInput(form, { input: null, path: ["bwsSettings"] });
    }
  },
});

const hasUnsavedChanges = computed(() => getDirtyInput(form));
</script>

<template>
  <div>
    <h1 class="text-2xl">General Settings</h1>
    <Card class="bg-background mt-4 flex w-full max-w-5xl justify-center">
      <CardContent>
        <Form :of="form" class="space-y-4" autocomplete="off" @submit="submitForm">
          <FieldGroup class="grid grid-cols-3 gap-3">
            <FormField :of="form" v-slot="field" :path="['name']">
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
          </FieldGroup>
          <Separator />
          <FieldGroup class="grid grid-cols-3 gap-3">
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
            <FormField :of="form" :path="['minTeamSize']" v-slot="field">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.props.name">Min Team Size</FieldLabel>
                <Input
                  required
                  type="number"
                  :disabled="!isTeamTournament"
                  :id="field.props.name"
                  v-model="field.input"
                  v-bind="field.props"
                  :aria-invalid="isInvalid(field)"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
              </Field>
            </FormField>
            <FormField :of="form" :path="['maxTeamSize']" v-slot="field">
              <Field :data-invalid="isInvalid(field)">
                <FieldLabel :for="field.props.name">Max Team Size</FieldLabel>
                <Input
                  required
                  type="number"
                  :disabled="!isTeamTournament"
                  :id="field.props.name"
                  v-model="field.input"
                  v-bind="field.props"
                  :aria-invalid="isInvalid(field)"
                />
                <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
              </Field>
            </FormField>
          </FieldGroup>
          <Separator />
          <FieldGroup class="grid grid-cols-[100%]">
            <FormField :of="form" :path="['isOpenRank']" v-slot="field">
              <Field :data-invalid="isInvalid(field)">
                <div class="flex items-center gap-2">
                  <Checkbox
                    name="open-rank-checkbox"
                    id="open-rank-checkbox"
                    v-model="isOpenRank.input"
                  />
                  <label for="open-rank-checkbox">Open rank?</label>
                </div>
              </Field>
            </FormField>
            <div class="flex items-start gap-2">
              <FormField :of="form" :path="['upperRankLimit']" v-slot="field">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.props.name">Upper Rank Limit</FieldLabel>
                  <Input
                    type="number"
                    :disabled="isOpenRank.input"
                    :id="field.props.name"
                    v-model.number="field.input"
                    v-bind="field.props"
                    :aria-invalid="isInvalid(field)"
                  />
                  <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
                </Field>
              </FormField>
              <FormField v-slot="field" :of="form" :path="['lowerRankLimit']">
                <Field :data-invalid="isInvalid(field, false)">
                  <FieldLabel :for="field.props.name">Lower Rank Limit</FieldLabel>
                  <Input
                    required
                    type="number"
                    :disabled="isOpenRank.input"
                    :id="field.props.name"
                    v-model.number="field.input"
                    v-bind="field.props"
                    :aria-invalid="isInvalid(field, false)"
                  />
                  <FieldError v-if="isInvalid(field, false)" :errors="field.errors ?? []" />
                </Field>
              </FormField>
            </div>
          </FieldGroup>
          <Separator />
          <FieldGroup class="grid grid-cols-[100%]">
            <div class="flex items-center gap-2">
              <Checkbox name="bws-checkbox" id="bws-checkbox" v-model="isBws" />
              <label for="bws-checkbox">Use BWS?</label>
            </div>
            <FieldGroup class="grid grid-cols-2 items-start gap-3">
              <FormField v-slot="field" :of="form" :path="['bwsSettings', 'type']">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.props.name">BWS Formula Type</FieldLabel>
                  <Select
                    :disabled="!isBws"
                    :id="field.props.name"
                    v-model="field.input"
                    v-bind="field.props"
                  >
                    <SelectTrigger :id="field.props.name">
                      <SelectValue placeholder="---" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="quadratic">Quadratic</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
                </Field>
              </FormField>
              <FormField :of="form" v-slot="field" :path="['bwsSettings', 'year']">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.props.name">Eligible Badge Year</FieldLabel>
                  <Input
                    type="number"
                    :disabled="!isBws"
                    :id="field.props.name"
                    :model-value="field.input ?? undefined"
                    v-bind="field.props"
                  />
                  <FieldDescription>
                    Only count badges from this year and onwards.
                  </FieldDescription>
                  <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
                </Field>
              </FormField>
            </FieldGroup>
            <div class="flex items-start gap-2">
              <FormField :of="form" v-slot="field" :path="['bwsSettings', 'x']">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.props.name">X</FieldLabel>
                  <Input
                    required
                    type="number"
                    step="any"
                    :disabled="!isBws"
                    :id="field.props.name"
                    :model-value="field.input ?? undefined"
                    :aria-invalid="isInvalid(field)"
                    v-bind="field.props"
                  />
                  <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
                </Field>
              </FormField>
              <FormField :of="form" v-slot="field" :path="['bwsSettings', 'y']">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.props.name">Y</FieldLabel>
                  <Input
                    required
                    type="number"
                    step="any"
                    :disabled="!isBws"
                    :id="field.props.name"
                    :model-value="field.input ?? undefined"
                    :aria-invalid="isInvalid(field)"
                    v-bind="field.props"
                  />
                  <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
                </Field>
              </FormField>
              <FormField :of="form" v-slot="field" :path="['bwsSettings', 'z']">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.props.name">Z</FieldLabel>
                  <Input
                    required
                    type="number"
                    step="any"
                    :disabled="!isBws"
                    :id="field.props.name"
                    :model-value="field.input ?? undefined"
                    :aria-invalid="isInvalid(field)"
                    v-bind="field.props"
                  />
                  <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
                </Field>
              </FormField>
            </div>
            <FieldDescription>
              <TournamentBwsFormula v-if="isBws" :bwsSettings="bwsSettings.input ?? undefined" />
            </FieldDescription>
          </FieldGroup>
          <div class="flex w-full items-center justify-between">
            <div class="flex items-center gap-2">
              <Button type="button" variant="destructive" @click="() => reset(form)">
                Reset
              </Button>
              <Alert class="bg-accent transition duration-300" v-show="hasUnsavedChanges">
                <AlertDescription class="flex items-center gap-2">
                  <Icon name="fa7-solid:triangle-exclamation" size="16" />
                  You have unsaved changes
                </AlertDescription>
              </Alert>
            </div>
            <Button type="submit"> Save </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  </div>
</template>
