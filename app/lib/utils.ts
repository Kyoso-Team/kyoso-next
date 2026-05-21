import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const buildUrl = {
  userAvatar: (osuId: number) => `https://a.ppy.sh/${osuId}`,
};
