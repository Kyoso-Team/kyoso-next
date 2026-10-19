export const parseUTCDateTime = (value: string) => {
  if (value.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(value)) {
    return Temporal.Instant.from(value).toZonedDateTimeISO("UTC");
  }

  return Temporal.PlainDateTime.from(value).toZonedDateTime("UTC");
};

export const parseUTCDate = (value: string) =>
  value.includes("T") ? parseUTCDateTime(value).toPlainDate() : Temporal.PlainDate.from(value);
