import type { Localized } from "../../../i18n/locale";
import type { VideoSource } from "../../../services/videoSources";

export type Orientation = "landscape" | "portrait";

/** Every item has a thumbnail by the time it reaches the shelf, unless none could be found. */
interface ShelfItemBase {
  id: string;
  title: Localized;
  description?: Localized;
  thumbnail?: string;
}

export interface VideoWork extends ShelfItemBase {
  kind: "video";
  orientation: Orientation;
  source: VideoSource;
}

/** A JSON file listing several videos. It opens as a grid of them. */
export interface VideoCollection extends ShelfItemBase {
  kind: "collection";
  videos: readonly VideoWork[];
}

/** An entry of `links.json`: a tile that leaves the site, e.g. for a YouTube channel. */
export interface VideoLink extends ShelfItemBase {
  kind: "link";
  url: string;
}

export type ShelfItem = VideoWork | VideoCollection | VideoLink;

export interface VideoCatalog {
  items: readonly ShelfItem[];
  /** Entries that couldn't be used, so mistakes are reported instead of silently dropped. */
  problems: readonly string[];
}
