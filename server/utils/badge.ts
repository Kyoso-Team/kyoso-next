const FILENAME_PATTERNS = [
  "soty",
  "SOTY",
  "skin[-_]",
  "chromab-",
  "iconsera-",
  "tow20\\d{2}",
  "obwc",
  "omc",
  "ofcm",
  "oimc",
  "fbc",
  "rbc",
  "rcbc",
  "gbc",
  "debc",
  "ojbc",
  "kcc",
  "ccc",
  "pdc",
  "aspire",
  "mbc",
  "triangles",
  "twin.?trials",
  "vmc",
  "mapping-\\d",
  "mca[-_]",
  "mf\\d",
  "cc20\\d{2}",
  "(summer|autumn|winter|spring)-20\\d{2}-(std|taiko|catch|mania)",
  "BN\\d+y",
  "NAT\\d+y",
  "elite-nominator",
  "mg20\\d{2}",
  "\\d+_?noms",
  "fapl-",
  "fat-",
  "tfac",
  "otfac",
  "wfac",
  "sfac",
  "elite.?mapper",
  "contributor",
  "quest.?trailblazer",
  "osb",
  "mod.?restricted",
  "monthly.?chart",
  "mapping[-_]",
  "charting[-_]",
  "beatmap[-_]",
  "pending[-_]",
  "pickem",
];

const DESCRIPTION_PATTERNS: RegExp[] = [
  /\bskin(ning|ner)?\s*(contest|of the year|entry|place|winner|finalist)/i,
  /\b(mapping|beatmap(ping)?|chart(ing)?)\s*(contest|cup|championship|world|award)/i,
  /\bmapper'?s?\s*(choice|favourite|favorite|guild)/i,
  /\b(beatmap nominator|elite nominator|nomination|storyboard(ing)?|featured artist|rhythm incarnate|spotlight|community choice|quest trailblazer)\b/i,
];

const filenameRegex = new RegExp(FILENAME_PATTERNS.join("|"), "i");

export function isNonTournamentBadge(badge: {
  imgFileName: string;
  description: string | null;
}): boolean {
  if (filenameRegex.test(badge.imgFileName)) {
    return true;
  }
  if (
    badge.description &&
    DESCRIPTION_PATTERNS.some((pattern) => pattern.test(badge.description!))
  ) {
    return true;
  }
  return false;
}
