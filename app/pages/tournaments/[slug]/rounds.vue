<script setup lang="ts">
import type { SubmitHandler } from "@formisch/vue";
import type {
  TournamentRoundConfig,
  TournamentRoundUpdate,
  TournamentRoundRow,
} from "~~/shared/validation/tournament/rounds";

import RoundForm from "~/components/tournament/rounds/RoundForm.vue";
import { configSummary, ROUND_TYPE_META } from "~/lib/rounds";
import { useRounds } from "~/mutations/rounds";
import { roundsQuery } from "~/queries/rounds";

const route = useRoute("tournaments-slug");

const { data } = useQuery(() => roundsQuery({ slug: route.params.slug }));

const rounds = computed(() => data.value?.rounds);

const hasQualifierRound = computed(() =>
  rounds.value?.some((round) => round.config.type === "qualifiers"),
);

const { createRound, updateRound, deleteRound, isDeleting } = useRounds();

const NODE_COLOR: Record<TournamentRoundConfig["type"], string> = {
  qualifiers: "bg-amber-500 border-amber-500",
  groups: "bg-blue-500 border-blue-500",
  bracket: "bg-primary border-primary",
};

const dialogOpen = ref(false);
const editing = ref<TournamentRoundRow | null>(null);

const openCreate = () => {
  editing.value = null;
  dialogOpen.value = true;
};

const openEdit = (round: TournamentRoundRow) => {
  editing.value = round;
  dialogOpen.value = true;
};

const handleSubmit = async (values: TournamentRoundUpdate) => {
  if (editing.value) {
    await updateRound(editing.value.id, values);
  } else {
    await createRound(values);
  }
  dialogOpen.value = false;
};

const handleDelete = async () => {
  if (!editing.value) return;
  await deleteRound(editing.value.id);
  dialogOpen.value = false;
};
</script>

<template>
  <div v-if="rounds">
    <div class="mb-6 flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-bold">Rounds</h1>
        <p class="text-muted-foreground text-sm">Tournament round flow</p>
      </div>
      <Button size="sm" @click="openCreate">
        <Icon name="fa7-solid:plus" class="size-3.5" />
        Add round
      </Button>
    </div>

    <div class="flex max-w-2xl flex-col py-2">
      <div v-for="(round, index) in rounds" :key="round.id" class="flex gap-4">
        <div class="flex w-4 flex-col items-center">
          <div
            class="z-10 mt-4 size-3 shrink-0 rounded-full border-2"
            :class="NODE_COLOR[round.config.type]"
          />
          <div v-if="index < rounds.length - 1" class="bg-border w-px flex-1" />
        </div>
        <Card class="mb-3 flex-1">
          <CardContent class="flex items-center justify-between gap-3 px-4">
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ round.name }}</span>
                <Badge :variant="ROUND_TYPE_META[round.config.type].badge">
                  <Icon :name="ROUND_TYPE_META[round.config.type].icon" />
                  {{ ROUND_TYPE_META[round.config.type].label }}
                </Badge>
                <Icon
                  v-if="round.config.type === 'qualifiers'"
                  name="lucide:lock"
                  class="text-muted-foreground size-3.5"
                />
              </div>
              <div class="text-muted-foreground flex flex-wrap gap-1.5 text-xs">
                <span class="capitalize">
                  {{ configSummary(round.config).join(" • ") }}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon-sm" @click="openEdit(round)">
              <Icon name="lucide:settings-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div class="flex gap-4">
        <div class="flex w-4 flex-col items-center">
          <div
            class="border-muted-foreground/50 mt-4 size-3 shrink-0 rounded-full border-2 border-dashed"
          />
        </div>
        <button
          type="button"
          class="text-muted-foreground hover:bg-muted/30 flex-1 rounded-lg border border-dashed py-3 text-sm transition-colors"
          @click="openCreate"
        >
          <Icon name="fa7-solid:plus" class="mr-1 size-3" />
          Add round
        </button>
      </div>
    </div>

    <Dialog v-model:open="dialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ editing ? `Edit ${editing.name}` : "Add round" }}</DialogTitle>
          <DialogDescription>
            {{ editing ? "Change the round's configuration." : "Configure a new round." }}
          </DialogDescription>
        </DialogHeader>
        <RoundForm
          :key="editing?.id ?? 'new'"
          :initial="editing ?? undefined"
          :hasQualifierRound="hasQualifierRound"
          @submit="handleSubmit"
        >
          <template v-if="editing" #footer-left>
            <Button variant="destructive" size="sm" :disabled="isDeleting" @click="handleDelete">
              <Icon name="lucide:trash-2" />
              Delete
            </Button>
          </template>
        </RoundForm>
      </DialogContent>
    </Dialog>
  </div>
</template>
