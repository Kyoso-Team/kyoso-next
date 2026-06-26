<script setup lang="ts">
const { setModal } = useModal();

const { tournaments } = useTournamentsList();

const viewMode = ref<"grid" | "list">("grid");
</script>

<template>
  <div class="flex h-full flex-col px-5 py-4">
    <Card class="flex-1 overflow-hidden pt-0">
      <CardHeader class="flex items-center justify-between gap-4 border-b-2 py-3">
        <div class="flex items-center gap-1">
          <Button
            :variant="viewMode === 'grid' ? 'default' : 'outline'"
            size="icon-sm"
            aria-label="Grid view"
            @click="viewMode = 'grid'"
          >
            <Icon name="fa7-solid:grid-horizontal" class="size-4" />
          </Button>
          <Button
            :variant="viewMode === 'list' ? 'default' : 'outline'"
            size="icon-sm"
            aria-label="List view"
            @click="viewMode = 'list'"
          >
            <Icon name="fa7-solid:list" class="size-4" />
          </Button>
        </div>
        <Button @click="setModal('ModalsCreateTournamentModal')">
          <Icon name="fa7-solid:plus" class="size-4" />
          Create tournament
        </Button>
      </CardHeader>
      <div
        v-if="tournaments?.length === 0"
        class="flex h-full flex-col items-center justify-center gap-4 px-4 py-12 text-center"
      >
        <div
          class="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-full"
        >
          <Icon name="lucide:trophy" class="size-8" />
        </div>
        <div class="max-w-sm space-y-1">
          <h2 class="text-xl font-semibold">No tournaments yet</h2>
          <p class="text-muted-foreground text-balance">
            Create your first tournament to start managing registrations, schedules, and staff.
          </p>
        </div>
        <Button @click="setModal('ModalsCreateTournamentModal')">
          <Icon name="fa7-solid:add" class="size-4" />
          Create tournament
        </Button>
      </div>
      <CardContent
        v-else
        class="overflow-auto py-4"
        :class="
          viewMode === 'grid'
            ? 'grid w-full grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4'
            : 'flex flex-col gap-1'
        "
      >
        <NuxtLink
          v-for="tournament in tournaments"
          :key="tournament.id"
          :to="{ name: 'tournaments-slug', params: { slug: tournament.slug } }"
          class="focus-visible:outline-none"
        >
          <DashboardTournamentCard v-if="viewMode === 'grid'" :tournament="tournament" />
          <DashboardTournamentListItem v-else :tournament="tournament" />
        </NuxtLink>
      </CardContent>
    </Card>
  </div>
</template>
