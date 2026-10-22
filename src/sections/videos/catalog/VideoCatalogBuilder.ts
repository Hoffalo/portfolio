import type { Localized } from "../../../i18n/locale";
import { compareNames, parseFolderPath, titleFromName, type FolderPath } from "./folderPath";
import { readCollectionSidecar, readLinkEntries, readVideoSidecar } from "./sidecars";
import type {
  ShelfItem,
  VideoCatalog,
  VideoCollection,
  VideoLink,
  VideoSidecar,
  VideoWork,
} from "./types";

const LINKS_FILE = "links.json";
const COLLECTION_FILE = "collection";
const COVER_FILE = "cover";

interface VideoDraft {
  path: FolderPath;
  url?: string;
  sidecar?: VideoSidecar;
}

/**
 * Builder: a video is described by up to three files (the video, its thumbnail, its JSON) that
 * arrive in no particular order, so parts are collected first and only assembled in `build()`,
 * once every file is known.
 */
export class VideoCatalogBuilder {
  private readonly videos = new Map<string, VideoDraft>();
  private readonly images = new Map<string, string>();
  private readonly collectionInfo = new Map<string, unknown>();
  private links: unknown = [];
  private readonly problems: string[] = [];

  /** `path` is relative to the videos folder; `url` is where the browser can load the file. */
  addFile(path: string, url: string): this {
    const parsed = parseFolderPath(path);
    if (parsed.role === "video") this.draftFor(parsed).url = url;
    else if (parsed.role === "image") this.images.set(parsed.key, url);
    return this;
  }

  addJson(path: string, data: unknown): this {
    const parsed = parseFolderPath(path);
    if (path === LINKS_FILE) this.links = data;
    else if (parsed.isCollectionRoot && parsed.name === COLLECTION_FILE)
      this.collectionInfo.set(parsed.collection!, data);
    else this.draftFor(parsed).sidecar = readVideoSidecar(data);
    return this;
  }

  build(): VideoCatalog {
    const works = [...this.videos.values()]
      .map((draft) => this.buildVideo(draft))
      .filter((work): work is VideoWork => work !== undefined);

    const looseVideos = works.filter((work) => !parseFolderPath(work.id).collection);
    const shelf: { sortName: string; item: ShelfItem }[] = [
      ...this.buildCollections(works).map((item) => ({ sortName: item.id, item })),
      ...looseVideos.map((item) => ({ sortName: item.id, item })),
    ];
    shelf.sort((a, b) => compareNames(a.sortName, b.sortName));

    return {
      items: [...shelf.map(({ item }) => item), ...this.buildLinks()],
      problems: [...this.problems],
    };
  }

  private draftFor(path: FolderPath): VideoDraft {
    let draft = this.videos.get(path.key);
    if (!draft) {
      draft = { path };
      this.videos.set(path.key, draft);
    }
    return draft;
  }

  private buildVideo({ path, url, sidecar = {} }: VideoDraft): VideoWork | undefined {
    const source = url ? ({ provider: "file", src: url } as const) : sidecar.source;
    if (!source) {
      this.problems.push(
        `${path.key}.json: no video file next to it and no valid "source", so it was skipped.`,
      );
      return undefined;
    }
    return {
      kind: "video",
      id: path.key,
      title: sidecar.title ?? bothLocales(titleFromName(path.name)),
      description: sidecar.description,
      orientation: sidecar.orientation ?? "landscape",
      poster: this.images.get(path.key),
      source,
    };
  }

  /** Every top-level folder with at least one video; an empty folder is a collection not yet filmed. */
  private buildCollections(works: readonly VideoWork[]): VideoCollection[] {
    const byFolder = new Map<string, VideoWork[]>();
    for (const work of works) {
      const folder = parseFolderPath(work.id).collection;
      if (folder) byFolder.set(folder, [...(byFolder.get(folder) ?? []), work]);
    }
    return [...byFolder].map(([folder, videos]) => {
      const info = readCollectionSidecar(this.collectionInfo.get(folder));
      return {
        kind: "collection",
        id: folder,
        title: info.title ?? bothLocales(titleFromName(folder)),
        description: info.description,
        cover: this.images.get(`${folder}/${COVER_FILE}`),
        videos: [...videos].sort((a, b) => compareNames(a.id, b.id)),
      };
    });
  }

  private buildLinks(): VideoLink[] {
    if (!Array.isArray(this.links)) {
      this.problems.push(`${LINKS_FILE}: expected a list of links, so it was ignored.`);
      return [];
    }
    const { entries, invalid } = readLinkEntries(this.links);
    for (const index of invalid)
      this.problems.push(
        `${LINKS_FILE}: entry ${index + 1} needs a "title" and a full "url" (https://…).`,
      );
    return entries.map((entry) => ({
      kind: "link",
      id: `link:${entry.url}`,
      title: entry.title,
      description: entry.description,
      url: entry.url,
      thumbnail: entry.thumbnail && this.resolveImage(entry.thumbnail),
    }));
  }

  /** Thumbnails are given as a file in the videos folder ("youtube.jpg") or a full URL. */
  private resolveImage(reference: string): string | undefined {
    if (/^https?:\/\//.test(reference)) return reference;
    const url = this.images.get(parseFolderPath(reference).key);
    if (!url) this.problems.push(`${LINKS_FILE}: thumbnail "${reference}" was not found.`);
    return url;
  }
}

const bothLocales = (text: string): Localized => ({ en: text, pt: text });
