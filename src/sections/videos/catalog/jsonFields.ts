import type { Localized } from "../../../i18n/locale";
import type { Orientation } from "./types";

/*
 * The JSON files are written by hand, so nothing in them is trusted: each reader accepts a field
 * only in the right shape, which lets a typo cost one field instead of the whole page.
 */

export type JsonObject = Record<string, unknown>;

export const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** One string for both languages, or `{ "en": …, "pt": … }`. */
export function readText(value: unknown): Localized | undefined {
  if (typeof value === "string" && value.trim()) return { en: value, pt: value };
  if (isJsonObject(value) && typeof value.en === "string" && typeof value.pt === "string")
    return { en: value.en, pt: value.pt };
  return undefined;
}

export function readOrientation(value: unknown): Orientation | undefined {
  return value === "portrait" || value === "landscape" ? value : undefined;
}

export function readWebUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol) ? value : undefined;
  } catch {
    return undefined;
  }
}

export const readString = (value: unknown) => (typeof value === "string" ? value : undefined);
