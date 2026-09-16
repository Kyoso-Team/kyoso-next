<script setup lang="ts">
import { toast } from "vue-sonner";
import type { StaffRole } from "~~/shared/validation/staff-registration";

import AcceptRolesPopover from "~/components/tournament/staff/AcceptRolesPopover.vue";
import { buildUrl } from "~/lib/utils";
import { staffApplicationQuery } from "~/queries/staff-applications";

const route = useRoute("tournaments-slug");

const { data, refetch } = useQuery(staffApplicationQuery({ slug: route.params.slug }));

const applications = computed(() => data.value ?? []);

const selected = ref(0);
const current = computed(() => applications.value[selected.value]);

const acceptStaffApplication = useMutation({
  mutation: (roles: StaffRole[]) =>
    $fetch(`/api/tournaments/${route.params.slug}/staff-application/${current.value?.id}/accept`, {
      method: "POST",
      body: roles,
    }),
  onSuccess: () => {
    toast.success("Staff application accepted");
    refetch();
  },
});

const rejectStaffApplication = useMutation({
  mutation: (id: number) =>
    $fetch(`/api/tournaments/${route.params.slug}/staff-application/${id}/reject`, {
      method: "DELETE",
    }),
  onSuccess: () => {
    toast.success("Staff application rejected");
    refetch();
  },
});
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <h1 class="mb-4 text-2xl">Staff Applications</h1>

    <div v-if="applications.length" class="flex min-h-0 flex-1 overflow-hidden rounded-md border">
      <div class="bg-sidebar w-64 shrink-0 overflow-y-auto border-r">
        <button
          v-for="(applicant, i) in applications"
          :key="applicant.id"
          class="flex w-full items-center gap-3 border-b px-3 py-2.5 text-left last:border-b-0"
          :class="i === selected ? 'bg-accent' : 'hover:bg-accent/50'"
          @click="selected = i"
        >
          <Avatar class="size-9 shrink-0 rounded-md">
            <AvatarImage :src="buildUrl.userAvatar(applicant.user.osuId)" />
          </Avatar>
          <div class="min-w-0">
            <p class="truncate text-sm font-medium">{{ applicant.user.username }}</p>
            <p class="text-muted-foreground truncate text-xs capitalize">
              {{ applicant.roles.map((r) => r).join(", ") }}
            </p>
          </div>
        </button>
      </div>

      <div v-if="current" :key="current.id" class="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div class="flex min-h-0 flex-1 flex-col">
          <div class="flex items-center gap-4 border-b p-4">
            <Avatar class="size-14 shrink-0 rounded-md">
              <AvatarImage :src="buildUrl.userAvatar(current.user.osuId)" />
            </Avatar>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <NuxtLink
                  class="hover:text-primary truncate text-lg font-semibold transition-colors hover:underline"
                  :href="`https://osu.ppy.sh/u/${current.user.osuId}`"
                  external
                  target="_blank"
                >
                  {{ current.user.username }}
                </NuxtLink>
              </div>
              <p
                v-if="current.user.discord"
                class="text-muted-foreground flex items-center gap-1 text-xs"
              >
                <Icon name="fa7-brands:discord" />
                {{ current.user.discord.username }}
              </p>
            </div>
          </div>

          <div class="border-b p-4">
            <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
              Applied roles
            </p>
            <div class="flex flex-wrap gap-1.5">
              <template v-if="current.roles.length">
                <Badge v-for="role in current.roles" :key="role" class="capitalize">
                  {{ role }}
                </Badge>
              </template>
              <span v-else class="text-muted-foreground text-sm">—</span>
            </div>
          </div>

          <div class="overflow-y-auto p-4">
            <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
              Past experience
            </p>
            <p
              v-if="current.notes"
              class="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap"
            >
              {{ current.notes }}
            </p>
            <p v-else class="text-muted-foreground text-sm italic">No past experience listed.</p>
          </div>
        </div>

        <div class="bg-sidebar/50 flex items-center justify-between gap-3 border-t p-4">
          <p class="text-muted-foreground text-xs">Decide on this application:</p>
          <div class="flex items-center gap-2">
            <Button variant="destructive" @click="rejectStaffApplication.mutate(current.id)">
              <Icon name="lucide:x" />
              Reject
            </Button>
            <AcceptRolesPopover
              v-if="current"
              :applicant="{ username: current.user.username, roles: current.roles as StaffRole[] }"
              @confirm="acceptStaffApplication.mutate"
            >
              <Button>
                <Icon name="lucide:check" />
                Accept
              </Button>
            </AcceptRolesPopover>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex min-h-0 flex-1 items-center justify-center rounded-md border">
      <p class="text-muted-foreground text-sm">No staff applications yet.</p>
    </div>
  </div>
</template>
