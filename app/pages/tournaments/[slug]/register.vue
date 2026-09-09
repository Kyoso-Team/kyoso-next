<script setup lang="ts">
import {
  Form,
  Field as FormField,
  setInput,
  useField,
  useForm,
  type SubmitHandler,
} from "@formisch/vue";
import dayjs from "dayjs";
import { tournamentTeamRegistrationCreateSchema } from "~~/shared/validation/tournament-registration";

import { buildTeamRegistrationConditions } from "~/components/tournament/register/team/conditions";
import TeamRequirements from "~/components/tournament/register/team/Requirements.vue";
import TeamSlotRow from "~/components/tournament/register/team/SlotRow.vue";
import type { ResolvedOsuUser } from "~/components/tournament/register/team/types";
import { isInvalid } from "~/components/ui/field/utils";
import { buildUrl } from "~/lib/utils";
import { useTournamentRegistration } from "~/mutations/registrations";
import { REGISTRATIONS_QUERY_KEYS } from "~/queries/registrations";

const slug = useRoute("tournaments-slug-register").params.slug;

const { tournament } = useTournament();
const { data: session } = useSession();

const { state: registerData, refresh: registerRefresh } = useQuery({
  key: REGISTRATIONS_QUERY_KEYS.bySlug(slug),
  query: () =>
    $fetch(`/api/tournaments/${slug}/registration`, {
      method: "GET",
      headers: useRequestHeaders(["cookie"]),
    }),
  placeholderData: (prev) => prev,
});
await registerRefresh();

watchEffect(() => {
  if (tournament.value?.data && tournament.value.data.type !== "teams") {
    navigateTo({ name: "tournaments-slug", params: { slug } });
  }
});

const form = useForm({
  schema: tournamentTeamRegistrationCreateSchema(tournament.value.data?.minTeamSize ?? 2),
  validate: "blur",
  revalidate: "input",
});

const teammateSlotCount = computed(() => {
  const maxTeamSize = tournament.value.data?.maxTeamSize;

  return !maxTeamSize ? 0 : maxTeamSize - 1;
});

const teammates = ref<(ResolvedOsuUser | null)[]>([]);

watch(
  teammateSlotCount,
  (count) => {
    teammates.value = Array.from({ length: count }, () => null);
  },
  { immediate: true },
);

const onResolved = (index: number, user: ResolvedOsuUser | null) => {
  teammates.value[index] = user;
};

const captain = computed<ResolvedOsuUser | null>(() => {
  const osu = session.value?.user.osu;

  if (!osu) return null;

  return {
    osuId: osu.osuId,
    username: osu.username,
    countryCode: osu.countryCode,
    osuRank: null,
    avatarUrl: buildUrl.userAvatar(osu.osuId),
  };
});

const resolvedPlayers = computed<ResolvedOsuUser[]>(() => {
  const resolvedTeammates = teammates.value.flatMap((user) => (user ? [user] : []));

  return captain.value ? [captain.value, ...resolvedTeammates] : resolvedTeammates;
});

const duplicateOsuIds = computed(() => {
  const seen = new Set<number>();
  const duplicates = new Set<number>();

  for (const player of resolvedPlayers.value) {
    if (seen.has(player.osuId)) duplicates.add(player.osuId);
    seen.add(player.osuId);
  }

  return duplicates;
});

watch(
  resolvedPlayers,
  (players) => {
    setInput(form, { path: ["playerIds"], input: players.map((player) => player.osuId) });
  },
  { immediate: true },
);

const nameField = useField(form, { path: ["name"] });

const isNameSet = computed(() => (nameField.input ?? "").trim().length >= 2);
const rowDuplicates = computed(() =>
  teammates.value.map((user) => (user ? duplicateOsuIds.value.has(user.osuId) : false)),
);
const isUnique = computed(() => duplicateOsuIds.value.size === 0);
const avatarPreview = ref<string | null>(null);

const agreedToRules = ref(false);

const onAvatarChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];

  if (file) avatarPreview.value = URL.createObjectURL(file);
};

const regsClosed = computed(() => {
  const end = tournament.value.data?.tournamentDates.playerRegs?.end;

  return !end || dayjs().isAfter(end);
});

const conditions = computed(() =>
  buildTeamRegistrationConditions(tournament.value.data, {
    isNameSet: isNameSet.value,
    resolvedCount: resolvedPlayers.value.length,
    isUnique: isUnique.value,
    hasAvatar: !!avatarPreview.value,
  }),
);

const canSubmit = computed(
  () =>
    !regsClosed.value &&
    agreedToRules.value &&
    conditions.value.length > 0 &&
    conditions.value.every((condition) => condition.optional || condition.done),
);

const { teamRegister, isTeamRegistering } = useTournamentRegistration();

const submitForm: SubmitHandler<ReturnType<typeof tournamentTeamRegistrationCreateSchema>> = async (
  values,
) => {
  await teamRegister(values).then(async () => {});
};
</script>

<template>
  <div
    v-if="tournament.status === 'success' && !registerData.data"
    class="min-h-0 flex-1 overflow-y-auto"
  >
    <Form
      :of="form"
      class="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4 lg:flex-row"
      @submit="submitForm"
    >
      <Card class="w-full">
        <CardHeader>
          <CardTitle>Roster</CardTitle>
          <CardDescription>{{ tournament.data.name }}</CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="captain" class="bg-muted/50 flex items-center gap-3 rounded-md px-2 py-2">
            <span
              class="bg-primary/10 text-primary flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            >
              1
            </span>
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <Avatar class="size-9">
                <AvatarImage :src="captain.avatarUrl" />
              </Avatar>
              <span class="truncate text-sm font-medium">{{ captain.username }}</span>
              <span class="text-muted-foreground ml-auto text-xs">captain · you</span>
            </div>
          </div>

          <TeamSlotRow
            v-for="i in teammateSlotCount"
            :key="i"
            :slot-number="i + 1"
            :is-duplicate="rowDuplicates[i - 1] ?? false"
            @resolved="(user) => onResolved(i - 1, user)"
          />
        </CardContent>
      </Card>

      <div class="flex w-full flex-col gap-4 lg:w-72 lg:shrink-0">
        <Card>
          <CardContent class="flex flex-col items-center gap-6">
            <div class="flex flex-col items-center gap-1">
              <label
                class="bg-muted hover:bg-accent flex size-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed"
              >
                <input type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
                <img v-if="avatarPreview" :src="avatarPreview" class="size-full object-cover" />
                <Icon v-else name="fa7-solid:camera" class="text-muted-foreground" />
              </label>
              <p class="text-muted-foreground text-xs">Team avatar (optional)</p>
            </div>

            <FormField :of="form" :path="['name']" v-slot="field">
              <Field :data-invalid="isInvalid(field)" class="gap-1">
                <Input
                  v-model="field.input"
                  v-bind="field.props"
                  :id="field.props.name"
                  :aria-invalid="isInvalid(field)"
                  autocomplete="off"
                  class="bg-transparent text-center text-lg font-bold shadow-none focus-visible:ring-0"
                  placeholder="Unnamed team"
                  maxlength="50"
                />
                <p class="text-muted-foreground text-center text-xs">Team name</p>
                <FieldError v-if="isInvalid(field)" :errors="field.errors ?? []" />
              </Field>
            </FormField>
            <p class="text-muted-foreground text-xs">
              {{ resolvedPlayers.length }}/{{ tournament.data.maxTeamSize }} players
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="flex flex-col gap-2 pt-6">
            <TeamRequirements :conditions="conditions" />

            <div class="mt-2 flex items-center gap-2">
              <Checkbox v-model="agreedToRules" name="rules-checkbox" id="rules-checkbox" />
              <label for="rules-checkbox" class="text-xs">
                I've read and agree to the rules of the tournament
              </label>
            </div>
            <Button class="w-full" type="submit" :disabled="!canSubmit || isTeamRegistering">
              <Spinner v-if="isTeamRegistering" />
              <span v-else>Register team</span>
            </Button>
            <p v-if="regsClosed" class="text-muted-foreground text-center text-xs">
              Registration has ended.
            </p>
            <p v-else-if="!canSubmit" class="text-muted-foreground text-center text-xs">
              Complete the checklist to submit.
            </p>
          </CardContent>
        </Card>
      </div>
    </Form>
  </div>

  <div v-else-if="registerData.data" class="flex flex-1 items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <CardContent class="flex flex-col items-center gap-3 pt-6 text-center">
        <Icon name="fa7-solid:circle-check" class="text-green-500" size="32" />
        <p class="font-semibold">You're already registered for this tournament.</p>
        <Button variant="secondary" as-child>
          <NuxtLink :to="{ name: 'tournaments-slug', params: { slug } }">
            Back to tournament
          </NuxtLink>
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
