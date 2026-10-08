export const LOCALES = ["en", "pt"] as const;
export type Locale = (typeof LOCALES)[number];

/** Any user-facing text in content files: one string per supported locale. */
export type Localized = Record<Locale, string>;

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function detectLocale(languages: readonly string[] = navigator.languages): Locale {
  return languages.some((language) => language.toLowerCase().startsWith("pt")) ? "pt" : "en";
}

/** Locale tags for Intl APIs; Portuguese follows Brazilian conventions. */
export const INTL_TAG: Record<Locale, string> = { en: "en-GB", pt: "pt-BR" };
