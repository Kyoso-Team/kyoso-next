import { describe, expect, it } from "vitest";

import { type BWSSettings } from "../validation/tournament";
import { calculateBws, getEligibleBadges } from "./bws";

const linear: BWSSettings = { type: "linear", x: 0.9937, y: 2, z: 1 };
const quadratic: BWSSettings = { type: "quadratic", x: 0.9937, y: 2, z: 1 };

const generateBadges = (id: number, awardedAt: Date, isBwsEligible = true) =>
  ({ id, awardedAt, isBwsEligible }) as never;

describe("getEligibleBadges", () => {
  const badges = [
    generateBadges(1, new Date("2020-06-01")),
    generateBadges(2, new Date("2022-03-15")),
    generateBadges(3, new Date("2024-11-30")),
  ];

  it("returns all badges when year is null", () => {
    expect(getEligibleBadges(badges, null)).toHaveLength(3);
  });

  it("returns all badges when year is undefined", () => {
    expect(getEligibleBadges(badges, undefined)).toHaveLength(3);
  });

  it("filters out badges awarded after the year", () => {
    const eligible = getEligibleBadges(badges, 2022);
    expect(eligible.map((b) => b.id)).toEqual([1, 2]);
  });

  it("includes badges awarded within the year", () => {
    expect(getEligibleBadges(badges, 2020).map((b) => b.id)).toEqual([1]);
  });

  it("returns all badges for a far future year", () => {
    expect(getEligibleBadges(badges, 2099)).toHaveLength(3);
  });

  describe("badge-level eligibility", () => {
    const badgesWithIneligible = [
      generateBadges(1, new Date("2020-06-01")),
      generateBadges(2, new Date("2022-03-15"), false),
      generateBadges(3, new Date("2024-11-30"), false),
    ];

    it("excludes badges marked as BWS-ineligible", () => {
      expect(getEligibleBadges(badgesWithIneligible, null).map((b) => b.id)).toEqual([1]);
    });

    it("excludes ineligible badges regardless of the year cutoff", () => {
      expect(getEligibleBadges(badgesWithIneligible, 2099).map((b) => b.id)).toEqual([1]);
    });

    it("combines badge eligibility with the year cutoff", () => {
      const badges = [
        generateBadges(1, new Date("2020-06-01"), false),
        generateBadges(2, new Date("2022-03-15")),
        generateBadges(3, new Date("2024-11-30")),
      ];
      expect(getEligibleBadges(badges, 2022).map((b) => b.id)).toEqual([2]);
    });
  });
});

describe("calculateBws", () => {
  it.each([
    { rank: 1, badgeAmount: 0 },
    { rank: 1, badgeAmount: 5 },
  ])("returns rank 1 unchanged (rank=$rank, badgeAmount=$badgeAmount)", ({ rank, badgeAmount }) => {
    expect(calculateBws({ rank, badgeAmount, settings: linear })).toBe(rank);
  });

  it.each([{ rank: 2 }, { rank: 50 }, { rank: 5949 }, { rank: 100000 }])(
    "returns rank unchanged when there are no badges (rank=$rank)",
    ({ rank }) => {
      expect(calculateBws({ rank, badgeAmount: 0, settings: linear })).toBe(rank);
      expect(calculateBws({ rank, badgeAmount: 0, settings: quadratic })).toBe(rank);
    },
  );

  it.each([
    { rank: 2, badgeAmount: 0, expected: 2 },
    { rank: 50, badgeAmount: 1, expected: Math.round(50 ** (0.9937 ** 1)) },
    { rank: 1000, badgeAmount: 2, expected: Math.round(1000 ** (0.9937 ** 4)) },
    {
      rank: 2727,
      badgeAmount: 3,
      expected: 1761,
    },
    {
      rank: 10000,
      badgeAmount: 4,
      expected: Math.round(10000 ** (0.9937 ** 16)),
    },
    {
      rank: 100000,
      badgeAmount: 5,
      expected: Math.round(100000 ** (0.9937 ** 25)),
    },
  ])(
    "linear: rank=$rank, badgeAmount=$badgeAmount -> $expected",
    ({ rank, badgeAmount, expected }) => {
      expect(Math.round(calculateBws({ rank, badgeAmount, settings: linear }))).toBe(expected);
    },
  );

  it.each([
    { rank: 2, badgeAmount: 0 },
    { rank: 50, badgeAmount: 1 },
    { rank: 1000, badgeAmount: 2 },
    { rank: 2727, badgeAmount: 3 },
    { rank: 10000, badgeAmount: 4 },
    { rank: 100000, badgeAmount: 5 },
  ])("quadratic: rank=$rank, badgeAmount=$badgeAmount", ({ rank, badgeAmount }) => {
    const { x, y, z } = quadratic;
    const expected = Math.round(rank ** (x ** ((badgeAmount * (badgeAmount + y)) / z)));
    expect(Math.round(calculateBws({ rank, badgeAmount, settings: quadratic }))).toBe(expected);
  });

  it.each([
    { rank: 1000, badgeAmount: 1, expected: 878 },
    { rank: 1000, badgeAmount: 5, expected: 254 },
    { rank: 1867, badgeAmount: 2, expected: 1288 },
    { rank: 1867, badgeAmount: 7, expected: 157 },
    { rank: 3986, badgeAmount: 3, expected: 1883 },
    { rank: 3986, badgeAmount: 10, expected: 49 },
    { rank: 12865, badgeAmount: 4, expected: 3397 },
    { rank: 12865, badgeAmount: 12, expected: 26 },
    { rank: 1000, badgeAmount: 21, expected: 1 },
    { rank: 12865, badgeAmount: 50, expected: 1 },
  ])(
    "reference table (quadratic): rank=$rank, badgeAmount=$badgeAmount -> $expected",
    ({ rank, badgeAmount, expected }) => {
      expect(Math.round(calculateBws({ rank, badgeAmount, settings: quadratic }))).toBe(expected);
    },
  );

  it("BWS is always lower than or equal to the original rank", () => {
    for (const rank of [2, 100, 2727, 50000, 100000]) {
      for (const badgeAmount of [0, 1, 3, 7]) {
        const bws = calculateBws({ rank, badgeAmount, settings: linear });
        expect(bws).toBeLessThanOrEqual(rank);
        expect(bws).toBeGreaterThanOrEqual(1);
      }
    }
  });

  describe("ineligible badges are excluded", () => {
    // Rank 5949 user with 1 eligible and 6 ineligible badges
    // (e.g. mapping contest / community contribution badges).
    // Counting all 7 badges (linear) wrongly yields 588.
    const userBadges = [
      generateBadges(1, new Date("2023-05-20")),
      generateBadges(2, new Date("2024-02-10"), false),
      generateBadges(3, new Date("2024-03-14"), false),
      generateBadges(4, new Date("2024-06-30"), false),
      generateBadges(5, new Date("2025-08-01"), false),
      generateBadges(6, new Date("2025-09-15"), false),
      generateBadges(7, new Date("2025-12-01"), false),
    ];

    it("filters badges down to 1 eligible badge without a year cutoff", () => {
      expect(getEligibleBadges(userBadges, null)).toHaveLength(1);
    });

    it("filters badges down to 1 eligible badge with a year cutoff", () => {
      expect(getEligibleBadges(userBadges, 2024)).toHaveLength(1);
    });

    it.each([
      { settings: linear, expected: 5632 },
      { settings: quadratic, expected: 5053 },
    ])(
      "rank 5949 with 1 eligible badge -> $expected ($settings.type)",
      ({ settings, expected }) => {
        const eligible = getEligibleBadges(userBadges, null).length;
        expect(eligible).toBe(1);
        expect(Math.round(calculateBws({ rank: 5949, badgeAmount: eligible, settings }))).toBe(
          expected,
        );
      },
    );
  });
});
