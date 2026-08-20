import type { InferOutput } from "valibot";
import type { createTournamentSchema } from "~~/shared/validation/tournaments";

import { tournamentsQuery } from "~/queries/tournament";

export const useTournamentsList = () => {
  const { setModal } = useModal();

  const { data: tournaments, refresh } = useQuery(tournamentsQuery());

  const createTournament = async (values: InferOutput<typeof createTournamentSchema>) => {
    await $fetch("/api/tournaments", {
      method: "POST",
      body: values,
    });

    setModal(null);

    await refresh();
  };

  return {
    tournaments,
    createTournament,
  };
};
