<script setup lang="ts">
import {
  FieldArray,
  Form,
  Field as FormField,
  getInput,
  insert,
  pickDirty,
  reset,
  useField,
  useFieldArray,
  useForm,
  handleSubmit,
  getDeepErrors,
} from "@formisch/vue";
import { today } from "@internationalized/date";
import { toast } from "vue-sonner";
import {
  tournamentDatesFormSchema,
  type TournamentDateCreate,
  type TournamentDates,
  type UpdateTournamentDates,
} from "~~/shared/validation/tournament-dates";

import { isInvalid } from "~/components/ui/field/utils";
import {
  formatCalendarDate,
  fromDateTimeLocalUTC,
  toCalendarDateString,
  toDateTimeLocalUTC,
} from "~/lib/date";
import { tournamentBySlugQuery } from "~/queries/tournament";

import CreateDateForm from "./CreateDateForm.vue";

const props = defineProps<{ dates: TournamentDates }>();

const { params } = useRoute("tournaments-slug");
const queryCache = useQueryCache();

const dates = toRef(props.dates);

const form = useForm({
  schema: tournamentDatesFormSchema,
  initialInput: dates.value,
});

const { mutate: updateDates } = useMutation({
  mutation: async (values: UpdateTournamentDates) => {
    await $fetch(`/api/tournaments/${params.slug}/dates`, {
      method: "PATCH",
      body: values,
      headers: useRequestHeaders(["cookie"]),
    });
  },
  onSuccess: () => {
    toast.success("Dates updated successfully.");
    queryCache.invalidateQueries({
      key: tournamentBySlugQuery({ slug: params.slug }).key,
    });
    reset(form, { initialInput: getInput(form) });
  },
});

const submitForm = handleSubmit(form, async (values) => {
  console.log(values);
  const dirty = pickDirty(form, { from: values });
  if (dirty) {
    updateDates(dirty as UpdateTournamentDates);
  }
});

const datesArray = useFieldArray(form, {
  path: ["dates"],
});

const playerRegsStartTime = useField(form, {
  path: ["playerRegs", "start"],
});
const playerRegsEndTime = useField(form, {
  path: ["playerRegs", "end"],
});

const staffRegsStartTime = useField(form, {
  path: ["staffRegs", "start"],
});

const modalOpen = ref(false);

const handleAddDate = (date: TournamentDateCreate) => {
  insert(form, { path: ["dates"], initialInput: date });
  modalOpen.value = false;
};
</script>

<template>
  <Dialog v-model:open="modalOpen">
    <div>
      <h1 class="text-2xl">Dates</h1>
      <span class="text-muted-foreground text-sm leading-normal font-normal">
        All times are provided in UTC
      </span>
      <Card class="bg-background mt-4 flex w-full max-w-5xl justify-center">
        <CardContent>
          <Form :of="form" @submit="handleSubmit" class="flex flex-col gap-4">
            <FieldGroup class="grid grid-cols-3 gap-3">
              <FormField :of="form" v-slot="field" :path="['playerRegs', 'start']">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.props.name">Player Registration Start</FieldLabel>
                  <Input
                    type="datetime-local"
                    :id="field.props.name"
                    :model-value="toDateTimeLocalUTC(field.input)"
                    @update:model-value="
                      (value) => (field.input = fromDateTimeLocalUTC(value as string))
                    "
                    v-bind="field.props"
                    :aria-invalid="isInvalid(field)"
                  />
                  <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
                </Field>
              </FormField>
              <FormField :of="form" :path="['playerRegs', 'end']" v-slot="field">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.props.name">Player Registration End</FieldLabel>
                  <Input
                    type="datetime-local"
                    :id="field.props.name"
                    :model-value="toDateTimeLocalUTC(field.input)"
                    @update:model-value="
                      (value) => (field.input = fromDateTimeLocalUTC(value as string))
                    "
                    v-bind="field.props"
                    :aria-invalid="isInvalid(field)"
                    :disabled="!playerRegsStartTime.input"
                    :min="toDateTimeLocalUTC(playerRegsStartTime.input)"
                  />
                  <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
                </Field>
              </FormField>
            </FieldGroup>
            <FieldGroup class="grid grid-cols-3 gap-3">
              <FormField :of="form" v-slot="field" :path="['staffRegs', 'start']">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.props.name">Staff Registration Start</FieldLabel>
                  <Input
                    type="datetime-local"
                    :id="field.props.name"
                    :model-value="toDateTimeLocalUTC(field.input)"
                    @update:model-value="
                      (value) => (field.input = fromDateTimeLocalUTC(value as string))
                    "
                    v-bind="field.props"
                    :aria-invalid="isInvalid(field)"
                  />
                  <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
                </Field>
              </FormField>
              <FormField :of="form" :path="['staffRegs', 'end']" v-slot="field">
                <Field :data-invalid="isInvalid(field)">
                  <FieldLabel :for="field.props.name">Staff Registration End</FieldLabel>
                  <Input
                    type="datetime-local"
                    :id="field.props.name"
                    :model-value="toDateTimeLocalUTC(field.input)"
                    @update:model-value="
                      (value) => (field.input = fromDateTimeLocalUTC(value as string))
                    "
                    v-bind="field.props"
                    :aria-invalid="isInvalid(field)"
                    :disabled="!staffRegsStartTime.input"
                    :min="toDateTimeLocalUTC(staffRegsStartTime.input)"
                  />
                  <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
                </Field>
              </FormField>
            </FieldGroup>
            <FieldSeparator v-if="datesArray.items.length > 0" />
            <FieldArray :of="form" :path="['dates']" v-slot="fieldArray">
              <div class="flex flex-col gap-2">
                <div
                  v-for="(_, index) in fieldArray.items"
                  class="bg-card flex gap-2 rounded-md p-3"
                  :key="index"
                >
                  <div class="flex flex-col justify-between">
                    <div class="flex items-baseline">
                      <FormField :of="form" :path="['dates', index, 'label']" v-slot="label">
                        <FormField :of="form" :path="['dates', index, 'type']" v-slot="type">
                          <span>
                            {{ label.input }}
                            <span class="text-muted-foreground text-xs capitalize"
                              >• {{ type.input }}
                            </span>
                          </span>
                        </FormField>
                      </FormField>
                    </div>
                    <div class="text-muted-foreground text-sm">
                      <FormField
                        :of="form"
                        :path="['dates', index, 'startDate']"
                        v-slot="startDate"
                      >
                        <FormField :of="form" :path="['dates', index, 'endDate']" v-slot="endDate">
                          <span
                            >{{ formatCalendarDate(startDate.input) }} -
                            {{ formatCalendarDate(endDate.input) }}</span
                          >
                        </FormField>
                      </FormField>
                    </div>
                  </div>
                </div>
              </div>
            </FieldArray>
            <div class="flex w-full items-center justify-between">
              <div class="flex items-center gap-2">
                <Button type="button" variant="destructive" @click="reset(form)"> Reset </Button>
                <!-- <Alert class="bg-accent transition duration-300">
                  <AlertDescription class="flex items-center gap-2">
                    <Icon name="fa7-solid:triangle-exclamation" size="16" />
                    You have unsaved changes
                  </AlertDescription>
                </Alert> -->
              </div>
              <div class="flex gap-2">
                <Button
                  type="button"
                  :disabled="!playerRegsEndTime.input"
                  variant="secondary"
                  @click="modalOpen = true"
                >
                  Add
                </Button>
                <Button
                  @click="
                    () => {
                      console.log(getInput(form));
                      console.log(getDeepErrors(form));
                      submitForm();
                    }
                  "
                >
                  Save
                </Button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add date</DialogTitle>
        </DialogHeader>
        <CreateDateForm
          :min-date="toCalendarDateString(playerRegsEndTime.input) || today('UTC').toString()"
          @submit="handleAddDate"
        />
      </DialogContent>
    </div>
  </Dialog>
</template>
