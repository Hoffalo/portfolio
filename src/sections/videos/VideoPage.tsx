import { useLocale } from "../../i18n/LocaleContext";
import { ShelfGrid } from "./ShelfGrid";
import { useVideoShelf } from "./useVideoShelf";

export function VideoPage() {
  const { ui } = useLocale();
  const shelf = useVideoShelf();
  if (shelf.length === 0) return <p className="status">{ui.noVideosYet}</p>;
  return <ShelfGrid layout="fill" entries={shelf} />;
}
