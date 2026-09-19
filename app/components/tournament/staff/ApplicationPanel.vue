<script setup lang="ts">
import {
  useForm,
  Form,
  Field as FormField,
  insert,
  remove,
  getInput,
  type SubmitHandler,
  reset,
} from "@formisch/vue";
import { toast } from "vue-sonner";
import {
  STAFF_ROLES,
  staffRegistrationCreateSchema,
  type StaffRegistrationCreate,
  type StaffRole,
} from "~~/shared/validation/staff-registration";

import { isInvalid } from "~/components/ui/field/utils";

const slug = useRoute("tournaments-slug").params.slug;

const form = useForm({
  schema: staffRegistrationCreateSchema,
});

const { user } = useUserSession();
const { tournament, refresh } = useTournament();

await refresh();

const canApplyForStaff = computed(() => {
  return Number(user?.value?.id) !== tournament.value?.data?.hostUserId;
});

const handleRoleChange = (role: StaffRole, checked: boolean | "indeterminate") => {
  if (checked === "indeterminate") return;
  if (checked) {
    insert(form, {
      path: ["roles"],
      initialInput: role,
    });
  } else {
    const index = getInput(form).roles.indexOf(role);
    if (index !== -1) {
      remove(form, {
        path: ["roles"],
        at: index,
      });
    }
  }
};

const { mutate } = useMutation({
  mutation: (values: StaffRegistrationCreate) =>
    $fetch(`/api/tournaments/${slug}/staff-application`, { method: "POST", body: values }),
  onSuccess: () => {
    reset(form);
    toast.success("Application submitted successfully");
  },
});

const handleSubmit: SubmitHandler<typeof staffRegistrationCreateSchema> = (values) => {
  mutate(values);
};
</script>

<template>
  <Dialog>
    <Button v-if="!canApplyForStaff" disabled class="h-10 w-full">Apply for staff</Button>
    <DialogTrigger v-else>
      <Button class="h-10 w-full">Apply for staff</Button>
    </DialogTrigger>
    <DialogContent class="max-h-[90vh]">
      <DialogTitle>Apply for staff</DialogTitle>
      <Form :of="form" class="space-y-4" @submit="handleSubmit">
        <FormField :of="form" :path="['roles']" v-slot="field">
          <Field :data-invalid="isInvalid(field)">
            <FieldLabel>Roles you want to take</FieldLabel>
            <FieldDescription> Select preferred staff roles you'd like to take</FieldDescription>
            <div class="flex flex-col gap-2">
              <template v-for="role in STAFF_ROLES">
                <div class="flex items-center gap-2">
                  <Checkbox @update:modelValue="(v) => handleRoleChange(role, v)" :id="role" />
                  <label class="capitalize" :for="role">{{ role }}</label>
                </div>
              </template>
            </div>
            <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
          </Field>
        </FormField>
        <FormField :of="form" :path="['notes']" v-slot="field">
          <Field :data-invalid="isInvalid(field)">
            <FieldLabel>Notes</FieldLabel>
            <FieldDescription>Describe your past staffing experience</FieldDescription>
            <Textarea
              class="max-h-110 min-h-20 resize-none overflow-y-auto"
              v-model="field.input"
              v-bind="field.props"
              placeholder="Describe your past staffing experience..."
              :aria-invalid="isInvalid(field)"
            />
            <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
          </Field>
        </FormField>
        <DialogFooter>
          <Button type="submit">Submit</Button>
        </DialogFooter>
      </Form>
    </DialogContent>
  </Dialog>
</template>
