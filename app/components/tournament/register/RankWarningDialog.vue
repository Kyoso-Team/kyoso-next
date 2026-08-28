<script setup lang="ts">
const open = defineModel<boolean>("open", { default: false });

defineProps<{
  isRegistering: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
}>();
</script>
<template>
  <AlertDialog :open="open" @update:open="open = $event">
    <AlertDialogContent>
      <AlertDialogTitle>Warning</AlertDialogTitle>
      <AlertDialogDescription class="space-y-3">
        <p>You are not in the required rank range to register for this tournament.</p>
        <p>
          You are still able to register, but you will be filtered out if you do not meet the rank
          requirements by the end of registration.
        </p>
      </AlertDialogDescription>
      <AlertDialogFooter>
        <Button variant="outline" @click="open = false">Cancel</Button>
        <Button :disabled="isRegistering" @click="emit('confirm')">
          <Spinner v-if="isRegistering" />
          <span v-else>I understand, sign up anyway</span>
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
