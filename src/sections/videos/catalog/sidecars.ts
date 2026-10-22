import type { Localized } from "../../../i18n/locale";
import { HOSTED_PROVIDERS, type HostedVideoSource } from "../../../services/videoSources";
import type { CollectionSidecar, LinkEntry, Orientation, VideoSidecar } from "./types";

/*
 * The JSON files are written by hand, so nothing in them is trusted: each reader keeps the fields
 * that have the right shape and ignores the rest, which lets a typo cost one field, not the page.
 */

type Json = Record<string, unknown>;

const isRecord = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function readText(value: unknown): Localized | undefined {
  if (typeof value === "string" && value.trim()) return { en: value, pt: value };
  if (isRecord(value) && typeof value.en === "string" && typeof value.pt === "string")
    return { en: value.en, pt: value.pt };
  return undefined;
}

function isWebUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function readOrientation(value: unknown): Orientation | undefined {
  return value === "portrait" || value === "landscape" ? value : undefined;
}

function readHostedSource(value: unknown): HostedVideoSource | undefined {
  if (!isRecord(value) || typeof value.id !== "string") return undefined;
  const provider = HOSTED_PROVIDERS.find((candidate) => candidate === value.provider);
  return provider && { provider, id: value.id };
}

export function readVideoSidecar(value: unknown): VideoSidecar {
  if (!isRecord(value)) return {};
  return {
    title: readText(value.title),
    description: readText(value.description),
    orientation: readOrientation(value.orientation),
    source: readHostedSource(value.source),
  };
}

export function readCollectionSidecar(value: unknown): CollectionSidecar {
  if (!isRecord(value)) return {};
  return { title: readText(value.title), description: readText(value.description) };
}

/** Entries without a title or a URL can't become a tile, so they are reported by position. */
export function readLinkEntries(value: unknown): { entries: LinkEntry[]; invalid: number[] } {
  const list = Array.isArray(value) ? value : [];
  const entries: LinkEntry[] = [];
  const invalid: number[] = [];
  list.forEach((item, index) => {
    const title = isRecord(item) ? readText(item.title) : undefined;
    if (!isRecord(item) || !title || !isWebUrl(item.url)) {
      invalid.push(index);
      return;
    }
    entries.push({
      title,
      url: item.url as string,
      description: readText(item.description),
      thumbnail: typeof item.thumbnail === "string" ? item.thumbnail : undefined,
    });
  });
  return { entries, invalid };
}
