import type { Nullish } from "~~/shared/types";
import { parseUTCDate, parseUTCDateTime } from "~~/shared/utils/date";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export const toDateTimeLocalUTC = (value: Nullish<string>) => {
  if (!value) return "";

  return parseUTCDateTime(value).toPlainDateTime().toString({ smallestUnit: "minute" });
};

export const fromDateTimeLocalUTC = (value: string | null) =>
  value ? Temporal.PlainDateTime.from(value).toZonedDateTime("UTC").toInstant().toString() : null;

export const toCalendarDateString = (value: Nullish<string>) => {
  if (!value) return "";
  return parseUTCDate(value).toString();
};

export const formatCalendarDate = (value: Nullish<string>) => {
  if (!value) return "";
  return dateFormatter.format(parseUTCDate(value));
};

export const todayUTC = () => Temporal.Now.plainDateISO("UTC").toString();
