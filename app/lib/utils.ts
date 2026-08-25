import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const buildUrl = {
  userAvatar: (osuId: number) => `https://a.ppy.sh/${osuId}`,
  badge: (fileName: string) => `https://assets.ppy.sh/profile-badges/${fileName}`,
  countryFlag: (countryCode: string) => `https://osuflags.omkserver.nl/${countryCode}-24.png`,
};
