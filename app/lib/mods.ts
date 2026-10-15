export const DEFAULT_SLOTS = ["NM", "HD", "HR", "DT", "FM", "EZ", "TB"] as const;
export type DefaultSlot = (typeof DEFAULT_SLOTS)[number];

export const DEFAULT_MOD_COLOR_MAP: Record<DefaultSlot | (string & {}), string> = {
  NM: "#A4C2F4",
  HD: "#F9CB9C",
  HR: "#EA9999",
  DT: "#B4A7D6",
  FM: "#B6D7A8",
  EZ: "#64FF5C",
  TB: "#A2C4C9",
};

// export const DEFAULT_MOD_BITMAP: Record<DefaultSlot | (string & {}), number> = {
//   NM: 0,
//   HD: ModsEnum.HD,
//   HR: ModsEnum.HR,
// };
