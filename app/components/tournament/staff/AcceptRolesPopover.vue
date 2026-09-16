<script setup lang="ts">
import type { StaffRole } from "~~/shared/validation/staff-registration";

const props = defineProps<{
  applicant: { username: string; roles: StaffRole[] };
}>();

const emits = defineEmits<{ confirm: [roles: StaffRole[]] }>();

const open = ref(false);
const selected = reactive(new Set<StaffRole>(props.applicant.roles));

watch(open, (isOpen) => {
  if (isOpen) selected.clear();
  for (const role of props.applicant.roles) selected.add(role);
});

const toggle = (role: StaffRole, checked: boolean | "indeterminate") => {
  if (checked === "indeterminate") return;

  if (checked) selected.add(role);
  if (!checked) selected.delete(role);
};
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <slot />
    </PopoverTrigger>
    <PopoverContent class="w-72" align="end">
      <p class="mb-1 text-sm font-medium">Accept roles for {{ applicant.username }}</p>
      <div class="flex flex-col gap-1.5">
        <label
          v-for="role in applicant.roles"
          :key="role"
          class="hover:bg-accent/50 flex cursor-pointer items-center gap-2 rounded-sm p-1.5"
        >
          <Checkbox
            :default-value="selected.has(role)"
            @update:model-value="(v) => toggle(role, v)"
          />
          <span class="text-sm capitalize">{{ role }}</span>
        </label>
        <p v-if="!applicant.roles.length" class="text-muted-foreground text-sm">
          No roles were applied for.
        </p>
      </div>
      <Button
        class="mt-3 w-full"
        size="sm"
        :disabled="!selected.size"
        @click="
          emits('confirm', [...selected]);
          open = false;
        "
      >
        Accept
        <span v-if="selected.size">({{ selected.size }})</span>
      </Button>
    </PopoverContent>
  </Popover>
</template>
