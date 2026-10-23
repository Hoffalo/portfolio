import { useMemo } from "react";
import { useLocale } from "../../i18n/LocaleContext";
import { toShelfEntry, type ShelfEntry } from "./shelfExhibits";
import { videoCatalog } from "./videoFolder";

/** The videos folder as the room and the page show it, rebuilt when the language changes. */
export function useVideoShelf(): ShelfEntry[] {
  const { t, ui } = useLocale();
  return useMemo(() => videoCatalog.items.map((item) => toShelfEntry(item, { t, ui })), [t, ui]);
}
