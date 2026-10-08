import type { YearMonth } from "../content/types";
import { INTL_TAG, type Locale } from "../i18n/locale";

export function formatYearMonth(value: YearMonth, locale: Locale): string {
  const [year, month] = value.split("-").map(Number);
  // Noon UTC avoids the date slipping into the previous month in negative-offset timezones.
  const date = new Date(Date.UTC(year!, month! - 1, 1, 12));
  return new Intl.DateTimeFormat(INTL_TAG[locale], {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatPeriod(
  start: YearMonth,
  end: YearMonth | undefined,
  locale: Locale,
  presentLabel: string,
) {
  return `${formatYearMonth(start, locale)} – ${end ? formatYearMonth(end, locale) : presentLabel}`;
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_TAG[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
