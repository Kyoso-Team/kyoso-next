<script setup lang="ts">
import type { InferOutput } from "valibot";
import type { AssetMetadata } from "~~/server/database/schema";
import type { createTournamentSchema } from "~~/shared/validation/tournaments";

import { DialogTrigger } from "~/components/ui/dialog";

export type Tournament = {
  id: number;
  name: string;
  slug: string;
  banner: AssetMetadata | null;
};

const isModalOpen = ref(false);

const { data: tournaments, refresh } = await useFetch("/api/tournaments/list", {
  key: "tournaments",
});

const createTournament = async (values: InferOutput<typeof createTournamentSchema>) => {
  await $fetch("/api/tournaments", {
    method: "POST",
    body: values,
  });

  isModalOpen.value = false;

  await refresh();
};

const viewMode = ref<"grid" | "list">("grid");
</script>

<template>
  <Dialog v-model:open="isModalOpen">
    <div class="flex h-full flex-col px-5 py-4">
      <Card class="flex-1 overflow-hidden pt-0">
        <CardHeader class="flex items-center justify-between border-b-2 py-2">
          <div class="flex gap-1">
            <Button
              :variant="viewMode === 'grid' ? 'default' : 'outline'"
              size="sm"
              @click="viewMode = 'grid'"
            >
              Grid
            </Button>
            <Button
              :variant="viewMode === 'list' ? 'default' : 'outline'"
              size="sm"
              @click="viewMode = 'list'"
            >
              List
            </Button>
          </div>
          <DialogTrigger as-child>
            <Button>Create tournament</Button>
          </DialogTrigger>
        </CardHeader>
        <div class="flex h-full items-center justify-center" v-if="tournaments?.length === 0">
          <p class="text-3xl">No tournaments yet.</p>
        </div>
        <CardContent
          v-else
          class="overflow-auto py-2"
          :class="
            viewMode === 'grid'
              ? 'grid w-full grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-6'
              : 'flex flex-col gap-0.5'
          "
        >
          <template v-if="viewMode === 'grid'">
            <DashboardTournamentCard
              v-for="tournament in tournaments"
              :key="tournament.id"
              :tournament="tournament"
            />
          </template>
          <DashboardTournamentListItem
            v-else
            v-for="tournament in tournaments"
            :key="tournament.id"
            :tournament="tournament"
          />
        </CardContent>
      </Card>
    </div>
    <DialogScrollContent>
      <DialogHeader>
        <DialogTitle>Create tournament</DialogTitle>
      </DialogHeader>
      <TournamentCreateForm @submit="createTournament" />
    </DialogScrollContent>
  </Dialog>
</template>
