<script setup lang="ts">
import {
  FieldArray,
  Form,
  Field as FormField,
  getInput,
  insert,
  move,
  remove,
  reset,
  useForm,
  useField,
  useFieldArray,
  type SubmitHandler,
} from "@formisch/vue";
import {
  QUALIFIER_SEEDING_METHODS,
  TIEBREAKER_OPTIONS,
  tournamentRoundUpdateSchema,
  type TiebreakerOption,
  type TournamentRoundConfig,
  type TournamentRoundUpdate,
} from "~~/shared/validation/tournament/rounds";

import { isInvalid } from "~/components/ui/field/utils";
import {
  BEST_OF_OPTIONS,
  defaultConfigFor,
  ROUND_TYPES,
  ROUND_TYPE_META,
  type RoundType,
  GROUP_TIEBREAKER_LABEL_MAP,
  SEEDING_METHOD_LABEL_MAP,
} from "~/lib/rounds";

const props = defineProps<{
  initial?: { name: string; config: TournamentRoundConfig };
  hasQualifierRound?: boolean;
}>();

const emit = defineEmits<{
  submit: [values: TournamentRoundUpdate];
}>();

const form = useForm({
  schema: tournamentRoundUpdateSchema,
  initialInput: props.initial
    ? { name: props.initial.name, config: props.initial.config }
    : { name: "", config: defaultConfigFor("bracket") },
  validate: "blur",
  revalidate: "input",
});

const typeField = useField(form, { path: ["config", "type"] });
const tiebreakers = useFieldArray(form, { path: ["config", "tiebreakerPriority"] });

const qualifierRuns = useField(form, { path: ["config", "runCount"] });

watch(
  () => typeField.input,
  (type) => {
    if (!type) return;
    reset(form, {
      initialInput: { name: getInput(form).name, config: defaultConfigFor(type as RoundType) },
    });
  },
);

function moveTiebreaker(index: number, dir: -1 | 1) {
  const target = index + dir;
  if (target < 0 || target >= tiebreakers.items.length) return;
  move(form, { path: ["config", "tiebreakerPriority"], from: index, to: target });
}

function removeTiebreaker(index: number) {
  remove(form, { path: ["config", "tiebreakerPriority"], at: index });
}

function addTiebreaker(value: TiebreakerOption) {
  insert(form, { path: ["config", "tiebreakerPriority"], initialInput: value });
}

const submit: SubmitHandler<typeof tournamentRoundUpdateSchema> = async (values) => {
  emit("submit", values);
};
</script>

<template>
  <Form :of="form" class="flex flex-col gap-4" @submit="submit">
    <FormField :of="form" :path="['name']" v-slot="field">
      <Field :data-invalid="isInvalid(field)">
        <FieldLabel required :for="field.props.name">Name</FieldLabel>
        <Input
          type="text"
          :id="field.props.name"
          v-model="field.input"
          v-bind="field.props"
          :aria-invalid="isInvalid(field)"
          placeholder="e.g. Grand Finals"
        />
        <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
      </Field>
    </FormField>

    <FormField v-if="!initial" :of="form" :path="['config', 'type']" v-slot="field">
      <Field :data-invalid="isInvalid(field)">
        <FieldLabel :for="field.props.name">Type</FieldLabel>
        <Select :id="field.props.name" v-model="field.input" v-bind="field.props">
          <SelectTrigger :id="field.props.name" :aria-invalid="isInvalid(field)">
            <SelectValue placeholder="---" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="type in ROUND_TYPES"
              :key="type"
              :value="type"
              :disabled="type === 'qualifiers' && props.hasQualifierRound"
            >
              {{ ROUND_TYPE_META[type].label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <FieldDescription v-if="typeField.input !== 'qualifiers'">
          Only one qualifiers round is allowed per tournament.
        </FieldDescription>
        <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
      </Field>
    </FormField>

    <template v-if="typeField.input === 'bracket' || typeField.input === 'groups'">
      <div class="grid grid-cols-3 gap-3">
        <FormField :of="form" :path="['config', 'bestOf']" v-slot="field">
          <Field :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.props.name">Best of</FieldLabel>
            <Select :id="field.props.name" v-model="field.input" v-bind="field.props">
              <SelectTrigger :id="field.props.name" :aria-invalid="isInvalid(field)">
                <SelectValue placeholder="---" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="bo in BEST_OF_OPTIONS" :key="bo" :value="bo">
                  {{ bo }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
          </Field>
        </FormField>
        <FormField :of="form" :path="['config', 'banCount']" v-slot="field">
          <Field :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.props.name">Bans</FieldLabel>
            <Input
              type="number"
              :id="field.props.name"
              :model-value="field.input ?? ''"
              @update:model-value="
                (value) => (field.input = value === '' ? undefined : Number(value))
              "
              v-bind="field.props"
              :aria-invalid="isInvalid(field)"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
          </Field>
        </FormField>
        <FormField :of="form" :path="['config', 'protectCount']" v-slot="field">
          <Field :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.props.name">Protects</FieldLabel>
            <Input
              type="number"
              :id="field.props.name"
              :model-value="field.input ?? ''"
              @update:model-value="
                (value) => (field.input = value === '' ? undefined : Number(value))
              "
              v-bind="field.props"
              :aria-invalid="isInvalid(field)"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
          </Field>
        </FormField>
      </div>
    </template>

    <template v-if="typeField.input === 'groups'">
      <Field>
        <FieldLabel>Tiebreaker priority</FieldLabel>
        <FieldDescription>Sorted by priority, highest first.</FieldDescription>
      </Field>
      <FieldArray :of="form" :path="['config', 'tiebreakerPriority']" v-slot="fieldArray">
        <div class="flex flex-col gap-1.5">
          <div
            v-for="(_, index) in fieldArray.items"
            :key="index"
            class="bg-card flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
          >
            <span class="text-muted-foreground w-4 text-xs tabular-nums">{{ index + 1 }}.</span>
            <FormField :of="form" :path="['config', 'tiebreakerPriority', index]" v-slot="item">
              <span class="flex-1">{{ GROUP_TIEBREAKER_LABEL_MAP[item.input!] }}</span>
            </FormField>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              :disabled="index === 0"
              @click="moveTiebreaker(index, -1)"
            >
              <Icon name="fa7-solid:chevron-up" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              :disabled="index === fieldArray.items.length - 1"
              @click="moveTiebreaker(index, 1)"
            >
              <Icon name="fa7-solid:chevron-down" />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" @click="removeTiebreaker(index)">
              <Icon name="fa7-solid:close" />
            </Button>
          </div>
          <FormField :of="form" :path="['config', 'tiebreakerPriority']" v-slot="array">
            <Select
              :model-value="''"
              @update:model-value="(value) => addTiebreaker(value as TiebreakerOption)"
            >
              <SelectTrigger class="text-muted-foreground">
                <SelectValue placeholder="Add tiebreaker…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="tiebreaker in TIEBREAKER_OPTIONS"
                  :key="tiebreaker"
                  :value="tiebreaker"
                  :disabled="(array.input ?? []).includes(tiebreaker)"
                >
                  {{ GROUP_TIEBREAKER_LABEL_MAP[tiebreaker] }}
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </FieldArray>
    </template>

    <template v-if="typeField.input === 'qualifiers'">
      <div class="grid grid-cols-3 gap-3">
        <FormField :of="form" :path="['config', 'runCount']" v-slot="field">
          <Field :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.props.name">Runs</FieldLabel>
            <Input
              type="number"
              :min="1"
              :id="field.props.name"
              :model-value="field.input"
              @update:model-value="
                (value) => (field.input = value === '' ? undefined : Number(value))
              "
              v-bind="field.props"
              :aria-invalid="isInvalid(field)"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
          </Field>
        </FormField>
        <FormField :of="form" :path="['config', 'summarizeRunsAs']" v-slot="field">
          <Field :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.props.name">Summarize runs as</FieldLabel>
            <Select
              :disabled="(qualifierRuns.input ?? 0) > 1"
              default-value="best"
              :id="field.props.name"
              v-model="field.input"
              v-bind="field.props"
            >
              <SelectTrigger :id="field.props.name" :aria-invalid="isInvalid(field)">
                <SelectValue placeholder="---" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best">Best</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="sum">Sum</SelectItem>
              </SelectContent>
            </Select>
            <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
          </Field>
        </FormField>
        <FormField :of="form" :path="['config', 'seedingMethod']" v-slot="field">
          <Field :data-invalid="isInvalid(field)">
            <FieldLabel :for="field.props.name">Seeding method</FieldLabel>
            <Select :id="field.props.name" v-model="field.input" v-bind="field.props">
              <SelectTrigger :id="field.props.name" :aria-invalid="isInvalid(field)">
                <SelectValue placeholder="---" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="method in QUALIFIER_SEEDING_METHODS"
                  :key="method"
                  :value="method"
                >
                  {{ SEEDING_METHOD_LABEL_MAP[method] }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
          </Field>
        </FormField>
      </div>
    </template>

    <div class="flex items-center justify-between gap-2">
      <div>
        <slot name="footer-left" />
      </div>
      <Button type="submit">{{ "Save" }}</Button>
    </div>
  </Form>
</template>
