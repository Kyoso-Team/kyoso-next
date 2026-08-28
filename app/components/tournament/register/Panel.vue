<script setup lang="ts">
import dayjs from "dayjs";
import { myRanksQuery } from "~~/app/queries/rank";
import type { Tournament } from "~~/shared/validation/tournaments";

import { cn } from "~/lib/utils";
import { useTournamentRegistration } from "~/mutations/registrations";

type PlayerRegsStatus =
  | {
      status: "not-started";
      date: Date;
    }
  | {
      status: "open" | "closed";
    };

const { tournament, isRegistered } = defineProps<{
  tournament: Tournament;
  isRegistered: boolean;
}>();

const playerRegs = computed<PlayerRegsStatus>(() => {
  if (!tournament.tournamentDates.playerRegs) return { status: "closed" };

  const { start, end } = tournament.tournamentDates.playerRegs;

  const regsNotStarted = dayjs().isBefore(start);
  const regsClosed = dayjs().isAfter(end);

  if (regsNotStarted) {
    return {
      status: "not-started",
      date: dayjs(start).toDate(),
    };
  }

  if (regsClosed) {
    return {
      status: "closed",
    };
  }

  return {
    status: "open",
  };
});

const { data: ranks } = useQuery(() => myRanksQuery());

const inRankRange = computed(() => {
  if (tournament.isOpenRank) return true;

  if (!ranks.value) return false;
  const rank = ranks.value.osuRank ?? 0;

  return rank >= (tournament.upperRankLimit ?? 0) && rank <= (tournament.lowerRankLimit ?? 0);
});

const regsEnd = computed(() => tournament.tournamentDates.playerRegs?.end ?? new Date());

const { soloRegister, isRegistering, revokeRegistration, isRevoking } = useTournamentRegistration();

const menuOpened = ref(false);
const warningModalOpened = ref(false);
const confirmModalOpened = ref(false);

watchEffect(() => {
  if (playerRegs.value.status === "closed") menuOpened.value = false;
});

const handleSignUp = async () => {
  if (!inRankRange.value) {
    warningModalOpened.value = true;
    return;
  }

  await soloRegister().then(() => {
    warningModalOpened.value = false;
    menuOpened.value = false;
  });
};

const handleRevoke = async () => {
  await revokeRegistration().then(() => {
    confirmModalOpened.value = false;
    menuOpened.value = false;
  });
};

const agreedToRules = ref(false);
</script>

<template>
  <div class="flex flex-col gap-2">
    <template v-if="!isRegistered">
      <span
        v-if="playerRegs.status === 'not-started'"
        class="text-muted-foreground text-center text-xs"
      >
        Registration opens
        <NuxtTime :datetime="playerRegs.date" relative />
      </span>
      <Button
        @click="menuOpened = !menuOpened"
        :disabled="playerRegs.status !== 'open'"
        :class="cn('flex h-10 w-full gap-1', { 'rounded-b-none': menuOpened })"
      >
        {{ tournament.type === "solo" ? "Player" : "Team" }} registration
        <span v-if="playerRegs.status === 'closed'" class="contents">closed</span>
        <Icon v-else-if="playerRegs.status === 'open'" name="fa7-solid:chevron-down" />
      </Button>
      <div
        v-if="menuOpened"
        class="bg-sidebar -mt-2 flex max-h-50 w-full flex-col gap-4 rounded-md rounded-t-none p-3 text-xs"
      >
        <TournamentRegisterRankRow :tournament="tournament" />

        <div class="flex items-center gap-2">
          <Checkbox v-model="agreedToRules" name="rules-checkbox" id="rules-checkbox" />
          <label for="rules-checkbox">I've read and agree to the rules of the tournament</label>
        </div>
        <Button
          variant="secondary"
          :disabled="!agreedToRules || isRegistering"
          class="h-6 w-full text-xs"
          @click="handleSignUp"
        >
          <Spinner v-if="isRegistering" />
          <span v-else>Sign up</span>
        </Button>
      </div>
    </template>

    <template v-else>
      <Button
        @click="menuOpened = !menuOpened"
        :disabled="playerRegs.status === 'closed'"
        :class="cn('flex h-10 w-full gap-1', { 'rounded-b-none': menuOpened })"
        variant="secondary"
      >
        <Icon name="fa7-solid:circle-check" class="text-green-500" />
        You're registered
        <Icon
          v-show="!menuOpened && playerRegs.status !== 'closed'"
          name="fa7-solid:chevron-down"
        />
        <Icon v-show="menuOpened" name="fa7-solid:chevron-up" />
      </Button>
      <div
        v-if="menuOpened"
        class="bg-sidebar -mt-2 flex max-h-50 w-full flex-col gap-4 rounded-md rounded-t-none p-3 text-xs"
      >
        <TournamentRegisterRankRow :tournament="tournament" />

        <p class="text-muted-foreground text-center text-xs">
          Your registration can be revoked until the end of
          {{ tournament.type === "solo" ? "player" : "team" }} registration
          <NuxtTime :datetime="regsEnd" relative />.
        </p>
        <Button
          variant="destructive"
          :disabled="isRevoking"
          class="h-6 w-full text-xs"
          @click="confirmModalOpened = true"
        >
          Revoke registration
        </Button>
      </div>
    </template>
  </div>

  <TournamentRegisterRankWarningDialog
    v-model:open="warningModalOpened"
    :is-registering="isRegistering"
    @confirm="handleSignUp"
  />
  <TournamentRegisterRevokeConfirmDialog
    v-model:open="confirmModalOpened"
    :is-revoking="isRevoking"
    @confirm="handleRevoke"
  />
</template>
