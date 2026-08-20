import { useRoute } from "vue-router";

import { tournamentBySlugQuery } from "~/queries/tournament";

export const useTournament = defineQuery(() => {
  const slug = useRoute("tournaments-slug").params.slug;

  const { state: tournament, ...rest } = useQuery({
    ...tournamentBySlugQuery({ slug }),
    enabled: !!slug,
  });

  return {
    tournament,
    ...rest,
  };
});
