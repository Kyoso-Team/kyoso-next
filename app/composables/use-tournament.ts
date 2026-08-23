import { useRoute } from "vue-router";

import { tournamentBySlugQuery } from "~/queries/tournament";

export const useTournament = () => {
  const route = useRoute("tournaments-slug");

  const { state: tournament, ...rest } = useQuery(() =>
    tournamentBySlugQuery({ slug: route.params.slug }),
  );

  return {
    tournament,
    ...rest,
  };
};
