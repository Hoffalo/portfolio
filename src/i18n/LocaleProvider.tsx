import { useEffect, useMemo, type ReactNode } from "react";
import { usePersistentState } from "../shared/usePersistentState";
import { LocaleContext, type LocaleContextValue } from "./LocaleContext";
import { detectLocale, INTL_TAG, isLocale } from "./locale";
import { uiStrings } from "./uiStrings";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = usePersistentState("locale", () => detectLocale(), isLocale);

  useEffect(() => {
    document.documentElement.lang = INTL_TAG[locale];
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: (text) => text[locale], ui: uiStrings[locale] }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
