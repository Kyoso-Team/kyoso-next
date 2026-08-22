import { DateFormatter, toCalendarDate } from "@internationalized/date";
import type { Nullish } from "~~/shared/types";
import { parseUTCDate, parseUTCDateTime } from "~~/shared/utils/date";

const dateFormatter = new DateFormatter("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export const toDateTimeLocalUTC = (value: Nullish<string>) => {
  if (!value) return "";

  const date = parseUTCDateTime(value);
  return `${String(date.year).padStart(4, "0")}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}T${String(date.hour).padStart(2, "0")}:${String(date.minute).padStart(2, "0")}`;
};

export const fromDateTimeLocalUTC = (value: string | null) =>
  value ? parseUTCDateTime(value).toDate().toISOString() : null;

export const toCalendarDateString = (value: Nullish<string>) => {
  if (!value) return "";
  return toCalendarDate(parseUTCDate(value)).toString();
};

export const formatCalendarDate = (value: Nullish<string>) => {
  if (!value) return "";
  const date = toCalendarDate(parseUTCDate(value));
  return dateFormatter.format(date.toDate("UTC"));
};
