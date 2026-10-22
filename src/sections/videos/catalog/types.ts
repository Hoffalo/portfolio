import type { Localized } from "../../../i18n/locale";
import type { HostedVideoSource, VideoSource } from "../../../services/videoSources";

export type Orientation = "landscape" | "portrait";

export interface VideoWork {
  kind: "video";
  /** The file's path inside the videos folder, without extension, e.g. "brasa/teaser". */
  id: string;
  title: Localized;
  description?: Localized;
  orientation: Orientation;
  /** An image with the video's file name; without one, a thumbnail is found or captured for it. */
  poster?: string;
  source: VideoSource;
}

/** A folder inside the videos folder. It opens as a grid of its videos. */
export interface VideoCollection {
  kind: "collection";
  id: string;
  title: Localized;
  description?: Localized;
  /** A `cover.*` image in the folder; without one, the first video's thumbnail stands in. */
  cover?: string;
  videos: readonly VideoWork[];
}

/** An entry of `links.json`: a tile that leaves the site, e.g. for a YouTube channel. */
export interface VideoLink {
  kind: "link";
  id: string;
  title: Localized;
  description?: Localized;
  url: string;
  thumbnail?: string;
}

export type ShelfItem = VideoWork | VideoCollection | VideoLink;

export interface VideoCatalog {
  items: readonly ShelfItem[];
  /** Files that were found but couldn't be used, so mistakes are reported instead of silently dropped. */
  problems: readonly string[];
}

/*
 * What the JSON files in the videos folder hold, once read. Every field is optional because the
 * folder must work with nothing but video files in it. videos/README.md documents the format.
 */

/** `<name>.json` next to `<name>.mp4`, or on its own with a `source` for a video hosted elsewhere. */
export interface VideoSidecar {
  title?: Localized;
  description?: Localized;
  orientation?: Orientation;
  source?: HostedVideoSource;
}

/** `collection.json` inside a collection's folder. */
export interface CollectionSidecar {
  title?: Localized;
  description?: Localized;
}

/** One entry of `links.json`. `thumbnail` is a file name in the videos folder or a full URL. */
export interface LinkEntry {
  title: Localized;
  url: string;
  description?: Localized;
  thumbnail?: string;
}
