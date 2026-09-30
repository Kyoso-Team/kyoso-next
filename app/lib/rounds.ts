import type {
  QualifierSeedingMethod,
  TiebreakerOption,
  TournamentRoundConfig,
} from "~~/shared/validation/tournament/rounds";

export const ROUND_TYPES = ["qualifiers", "groups", "bracket"] as const;
export type RoundType = (typeof ROUND_TYPES)[number];

export const GROUP_TIEBREAKER_LABEL_MAP: Record<TiebreakerOption, string> = {
  match_wins: "Match wins",
  pd: "Point differential",
  overall_pd: "Overall point difference",
  qualifier_seed: "Qualifiers seed",
};

export const SEEDING_METHOD_LABEL_MAP: Record<QualifierSeedingMethod, string> = {
  avg_score: "Average score",
  percent_diff: "Percent difference",
  percent_max: "Percent max",
  sum_of_placements: "Sum of placements",
  z_percentile: "Z-percentile",
  z_sum: "Z-sum",
  zipfs_law: "Zipf's Law",
};

export const ROUND_TYPE_META: Record<
  RoundType,
  { label: string; badge: "default" | "secondary" | "outline"; icon: string }
> = {
  bracket: { label: "Bracket", badge: "default", icon: "fa7-solid:trophy" },
  groups: { label: "Groups", badge: "secondary", icon: "fa7-solid:table-cells" },
  qualifiers: { label: "Qualifiers", badge: "outline", icon: "fa7-solid:clipboard-list" },
};

export const BEST_OF_OPTIONS = [7, 9, 11, 13] as const;

export function defaultConfigFor(type: RoundType): TournamentRoundConfig {
  switch (type) {
    case "bracket":
      return { type: "bracket", bestOf: 9, banCount: 1, protectCount: undefined };
    case "groups":
      return {
        type: "groups",
        bestOf: 9,
        banCount: 1,
        protectCount: undefined,
        tiebreakerPriority: ["match_wins", "pd"],
      };
    case "qualifiers":
      return {
        type: "qualifiers",
        runCount: 1,
        summarizeRunsAs: "best",
        seedingMethod: "avg_score",
      };
  }
}

export function configSummary(config: TournamentRoundConfig): string[] {
  switch (config.type) {
    case "bracket":
      return [
        `Best of ${config.bestOf}`,
        `${config.banCount} ban`,
        ...(config.protectCount ? [`${config.protectCount} protect`] : []),
      ];
    case "groups":
      return [
        `Best of ${config.bestOf}`,
        `${config.banCount} ban`,
        ...(config.protectCount ? [`${config.protectCount} protect`] : []),
        `${config.tiebreakerPriority.length} tiebreakers`,
      ];
    case "qualifiers":
      return [
        `${config.runCount} run${config.runCount !== 1 ? "s" : ""}`,
        config.summarizeRunsAs,
        config.seedingMethod.replaceAll("_", " "),
      ];
  }
}
