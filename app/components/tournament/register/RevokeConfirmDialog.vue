<script setup lang="ts">
const open = defineModel<boolean>("open", { default: false });

defineProps<{
  isRevoking: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
}>();
</script>

<template>
  <AlertDialog :open="open" @update:open="open = $event">
    <AlertDialogContent>
      <AlertDialogTitle>Revoke registration</AlertDialogTitle>
      <AlertDialogDescription class="space-y-3">
        <p>Are you sure you want to revoke your registration for this tournament?</p>
        <p>You can register again as long as registration is still open.</p>
      </AlertDialogDescription>
      <AlertDialogFooter>
        <Button variant="outline" @click="open = false">Cancel</Button>
        <Button variant="destructive" :disabled="isRevoking" @click="emit('confirm')">
          <Spinner v-if="isRevoking" />
          <span v-else>Revoke registration</span>
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
