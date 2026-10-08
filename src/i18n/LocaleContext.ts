import { createContext, useContext } from "react";
import type { Locale, Localized } from "./locale";
import type { UiStrings } from "./uiStrings";

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Picks the current locale's text from a content entry. */
  t: (text: Localized) => string;
  ui: UiStrings;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used inside <LocaleProvider>");
  return value;
}
