import { parseAbsolute, parseDate, parseDateTime, toZoned } from "@internationalized/date";

export const parseUTCDateTime = (value: string) => {
  if (value.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(value)) {
    return parseAbsolute(value, "UTC");
  }

  return toZoned(parseDateTime(value), "UTC");
};

export const parseUTCDate = (value: string) =>
  value.includes("T") ? parseUTCDateTime(value) : parseDate(value);
