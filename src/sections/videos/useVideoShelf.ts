import { useMemo } from "react";
import { useLocale } from "../../i18n/LocaleContext";
import { toShelfEntry, type ShelfEntry } from "./shelfExhibits";
import { useThumbnails } from "./thumbnails";
import { videoCatalog } from "./videoFolder";

/** The videos folder as the room and the page show it, rebuilt when the language or a thumbnail changes. */
export function useVideoShelf(): ShelfEntry[] {
  const { t, ui } = useLocale();
  const thumbnailOf = useThumbnails();
  return useMemo(
    () => videoCatalog.items.map((item) => toShelfEntry(item, { t, ui, thumbnailOf })),
    [t, ui, thumbnailOf],
  );
}
