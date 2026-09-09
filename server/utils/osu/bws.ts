import dayjs from "dayjs";
import type { badges } from "~~/server/database/schema";

import { type BWSSettings } from "../validation/tournament";

type Badge = typeof badges.$inferSelect & { awardedAt: Date };

export const getEligibleBadges = (
  badges: Pick<Badge, "id" | "isBwsEligible" | "awardedAt">[],
  year: number | null | undefined,
) => {
  const filteredBadges = badges.filter((b) => b.isBwsEligible);
  if (!year) return filteredBadges;
  return filteredBadges.filter((b) => dayjs(b.awardedAt).year() <= year);
};

export const calculateBws = ({
  rank,
  badgeAmount,
  settings,
}: {
  rank: number;
  badgeAmount: number;
  settings: BWSSettings;
}) => {
  if (rank === 1 || badgeAmount === 0) return rank;

  const { type, x, y, z } = settings;

  if (type === "linear") {
    return rank ** (x ** (badgeAmount ** y));
  }

  if (type === "quadratic") {
    return rank ** (x ** ((badgeAmount * (badgeAmount + y)) / z));
  }

  return rank;
};
