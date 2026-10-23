import type { Localized } from "../../../i18n/locale";
import { parseVideoLink, thumbnailUrl } from "../../../services/videoSources";
import { baseName, compareNames, titleFromName } from "./fileNames";
import {
  isJsonObject,
  readOrientation,
  readString,
  readText,
  readWebUrl,
  type JsonObject,
} from "./jsonFields";
import type { ShelfItem, VideoCatalog, VideoCollection, VideoLink, VideoWork } from "./types";

const LINKS_FILE = "links.json";

/**
 * Builder: JSON files name their thumbnails ("thumbnail": "brasa.jpg"), and the images can arrive
 * before or after the JSON that uses them. Everything is collected first and only assembled in
 * `build()`, once every file is known.
 */
export class VideoCatalogBuilder {
  private readonly images = new Map<string, string>();
  private readonly entries = new Map<string, unknown>();
  private links: unknown = [];
  private readonly problems: string[] = [];

  /** `path` is relative to the videos folder; `url` is where the browser can load the image. */
  addImage(path: string, url: string): this {
    this.images.set(path, url);
    return this;
  }

  addJson(path: string, content: unknown): this {
    if (path === LINKS_FILE) this.links = content;
    else this.entries.set(path, content);
    return this;
  }

  build(): VideoCatalog {
    const shelf = [...this.entries.keys()]
      .sort(compareNames)
      .map((path) => this.buildEntry(path, this.entries.get(path)))
      .filter((item): item is ShelfItem => item !== undefined);
    return { items: [...shelf, ...this.buildLinks()], problems: [...this.problems] };
  }

  /** A file with a "videos" list is a collection; any other is a single video. */
  private buildEntry(path: string, content: unknown): ShelfItem | undefined {
    if (!isJsonObject(content)) {
      this.problems.push(`${path}: expected an object ({ … }), so it was skipped.`);
      return undefined;
    }
    const fallbackTitle = bothLocales(titleFromName(baseName(path)));
    return Array.isArray(content.videos)
      ? this.buildCollection(path, content, content.videos, fallbackTitle)
      : this.buildVideo(content, { id: path, where: path, fallbackTitle });
  }

  private buildCollection(
    path: string,
    content: JsonObject,
    entries: readonly unknown[],
    fallbackTitle: Localized,
  ): VideoCollection | undefined {
    const videos = entries
      .map((entry, index) => {
        const where = `${path}, video ${index + 1}`;
        if (isJsonObject(entry)) return this.buildVideo(entry, { id: `${path}#${index}`, where });
        this.problems.push(`${where}: expected an object ({ … }), so it was skipped.`);
        return undefined;
      })
      .filter((video): video is VideoWork => video !== undefined);
    // An empty list is a collection set up before its videos are published: hidden, not an error.
    if (videos.length === 0) return undefined;
    return {
      kind: "collection",
      id: path,
      title: readText(content.title) ?? fallbackTitle,
      description: readText(content.description),
      thumbnail: this.resolveImage(content.thumbnail, path) ?? videos[0]!.thumbnail,
      videos,
    };
  }

  private buildVideo(
    content: JsonObject,
    { id, where, fallbackTitle }: { id: string; where: string; fallbackTitle?: Localized },
  ): VideoWork | undefined {
    const link = parseVideoLink(readString(content.url) ?? "");
    const title = readText(content.title) ?? fallbackTitle;
    if (!link) {
      this.problems.push(`${where}: "url" must be a YouTube, Vimeo or Google Drive video link.`);
      return undefined;
    }
    if (!title) {
      this.problems.push(`${where}: needs a "title".`);
      return undefined;
    }
    return {
      kind: "video",
      id,
      title,
      description: readText(content.description),
      orientation:
        readOrientation(content.orientation) ?? (link.vertical ? "portrait" : "landscape"),
      thumbnail: this.resolveImage(content.thumbnail, where) ?? thumbnailUrl(link.source),
      source: link.source,
    };
  }

  private buildLinks(): VideoLink[] {
    if (!Array.isArray(this.links)) {
      this.problems.push(`${LINKS_FILE}: expected a list ([ … ]), so it was ignored.`);
      return [];
    }
    return this.links
      .map((entry, index) => this.buildLink(entry, `${LINKS_FILE}, entry ${index + 1}`))
      .filter((link): link is VideoLink => link !== undefined);
  }

  private buildLink(entry: unknown, where: string): VideoLink | undefined {
    const title = isJsonObject(entry) ? readText(entry.title) : undefined;
    const url = isJsonObject(entry) ? readWebUrl(entry.url) : undefined;
    if (!isJsonObject(entry) || !title || !url) {
      this.problems.push(`${where}: needs a "title" and a full "url" (https://…).`);
      return undefined;
    }
    return {
      kind: "link",
      id: `link:${url}`,
      title,
      description: readText(entry.description),
      url,
      thumbnail: this.resolveImage(entry.thumbnail, where),
    };
  }

  /** A thumbnail is an image in the videos folder ("brasa.jpg") or a full URL. */
  private resolveImage(reference: unknown, where: string): string | undefined {
    if (typeof reference !== "string") return undefined;
    const url = readWebUrl(reference) ?? this.images.get(reference);
    if (!url) this.problems.push(`${where}: thumbnail "${reference}" was not found.`);
    return url;
  }
}

const bothLocales = (text: string): Localized => ({ en: text, pt: text });
