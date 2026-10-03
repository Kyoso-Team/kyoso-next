export const buildUrl = {
  userAvatar: (osuId: number) => `https://a.ppy.sh/${osuId}`,
  userProfile: (osuId: number) => `https://osu.ppy.sh/u/${osuId}`,
  badge: (fileName: string) => `https://assets.ppy.sh/profile-badges/${fileName}`,
  countryFlag: (countryCode: string) => `https://osuflags.omkserver.nl/${countryCode}-24.png`,
};
