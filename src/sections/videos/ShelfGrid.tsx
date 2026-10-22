import { useOpenExhibit } from "../useOpenExhibit";
import type { ShelfEntry } from "./shelfExhibits";
import { useThumbnails } from "./thumbnails";
import { ShelfTile } from "./VideoMedia";

interface ShelfGridProps {
  entries: readonly ShelfEntry[];
  /** "pairs" is the two-column grid inside a collection's popup; "fill" uses the page's width. */
  layout: "pairs" | "fill";
}

export function ShelfGrid({ entries, layout }: ShelfGridProps) {
  const thumbnailOf = useThumbnails();
  const openExhibit = useOpenExhibit();
  return (
    <ul className="shelf-grid" data-layout={layout}>
      {entries.map(({ item, exhibit }) => (
        <li key={item.id}>
          <ShelfTile
            item={item}
            thumbnail={thumbnailOf(item)}
            onOpen={() => openExhibit(exhibit)}
          />
        </li>
      ))}
    </ul>
  );
}
