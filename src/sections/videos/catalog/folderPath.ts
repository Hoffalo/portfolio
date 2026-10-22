const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "m4v"]);
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);

export type FileRole = "video" | "image" | "metadata" | "other";

/** A file's place in the videos folder, which is all the folder convention needs to know about it. */
export interface FolderPath {
  /** The top-level folder holding the file, which is its collection. Undefined at the top level. */
  collection?: string;
  /** The path without its extension. Files sharing a key describe the same video. */
  key: string;
  /** The file name without its extension. */
  name: string;
  role: FileRole;
  /** Directly inside a collection's folder, where `collection.json` and `cover.*` belong. */
  isCollectionRoot: boolean;
}

/** `path` is relative to the videos folder, e.g. "brasa/01-teaser.mp4". */
export function parseFolderPath(path: string): FolderPath {
  const segments = path.split("/");
  const fileName = segments[segments.length - 1]!;
  const dot = fileName.lastIndexOf(".");
  const name = dot > 0 ? fileName.slice(0, dot) : fileName;
  const extension = dot > 0 ? fileName.slice(dot + 1).toLowerCase() : "";
  return {
    collection: segments.length > 1 ? segments[0] : undefined,
    key: dot > 0 ? path.slice(0, path.length - extension.length - 1) : path,
    name,
    role: roleOf(extension),
    isCollectionRoot: segments.length === 2,
  };
}

function roleOf(extension: string): FileRole {
  if (VIDEO_EXTENSIONS.has(extension)) return "video";
  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  if (extension === "json") return "metadata";
  return "other";
}

/** Number prefixes only set the order, so "02-conference_teaser" is titled "Conference teaser". */
export function titleFromName(name: string): string {
  const words = name
    .replace(/^\d+[\s._-]*/, "")
    .replace(/[_-]+/g, " ")
    .trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Natural order, so "2-…" comes before "10-…". */
export const compareNames = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
