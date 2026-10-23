export type VideoProvider = "youtube" | "vimeo" | "drive" | "instagram";

/** A video on a streaming platform, identified by the ID in its link. */
export interface VideoSource {
  provider: VideoProvider;
  id: string;
}

/**
 * Adapter: each platform has its own link formats; this one interface reads them and builds
 * everything the site needs (thumbnail, embeddable player, public page) from just the ID.
 */
interface ProviderAdapter {
  /** The video's ID if the link is one of this provider's videos. */
  idFrom(link: URL): string | undefined;
  /** Vertical formats (YouTube Shorts, Instagram Reels) can be recognised from the link alone. */
  isVertical(link: URL): boolean;
  /** Undefined when the platform has no public image URL; the JSON then has to name one. */
  thumbnail(id: string): string | undefined;
  embed(id: string): string;
  watch(id: string): string;
}

const pathSegments = (link: URL) => link.pathname.split("/").filter(Boolean);

/** "www.youtube.com" and "m.youtube.com" are the same site as "youtube.com". */
const isHost = (link: URL, domain: string) =>
  link.hostname === domain || link.hostname.endsWith(`.${domain}`);

const YOUTUBE_ID_PATHS = new Set(["shorts", "embed", "live"]);
const INSTAGRAM_ID_PATHS = new Set(["reel", "reels", "p", "tv"]);

const adapters: Record<VideoProvider, ProviderAdapter> = {
  youtube: {
    idFrom: (link) => {
      if (isHost(link, "youtu.be")) return pathSegments(link)[0];
      if (!isHost(link, "youtube.com") && !isHost(link, "youtube-nocookie.com")) return undefined;
      const [first, second] = pathSegments(link);
      if (first && second && YOUTUBE_ID_PATHS.has(first)) return second;
      return link.searchParams.get("v") ?? undefined;
    },
    isVertical: (link) => pathSegments(link)[0] === "shorts",
    thumbnail: (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    // The privacy-enhanced domain avoids setting tracking cookies until the visitor presses play.
    embed: (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
    watch: (id) => `https://www.youtube.com/watch?v=${id}`,
  },
  vimeo: {
    idFrom: (link) => {
      if (!isHost(link, "vimeo.com")) return undefined;
      return pathSegments(link).find((segment) => /^\d+$/.test(segment));
    },
    isVertical: () => false,
    thumbnail: (id) => `https://vumbnail.com/${id}.jpg`,
    embed: (id) => `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`,
    watch: (id) => `https://vimeo.com/${id}`,
  },
  drive: {
    idFrom: (link) => {
      if (link.hostname !== "drive.google.com") return undefined;
      const [first, second, third] = pathSegments(link);
      if (first === "file" && second === "d") return third;
      return link.searchParams.get("id") ?? undefined;
    },
    isVertical: () => false,
    // Only works for files shared as "Anyone with the link".
    thumbnail: (id) => `https://drive.google.com/thumbnail?id=${id}&sz=w800`,
    embed: (id) => `https://drive.google.com/file/d/${id}/preview`,
    watch: (id) => `https://drive.google.com/file/d/${id}/view`,
  },
  instagram: {
    idFrom: (link) => {
      if (!isHost(link, "instagram.com")) return undefined;
      // Profile links prefix the post: instagram.com/<user>/reel/<id>.
      const segments = pathSegments(link);
      const index = segments.findIndex((segment) => INSTAGRAM_ID_PATHS.has(segment));
      return index === -1 ? undefined : segments[index + 1];
    },
    isVertical: (link) => pathSegments(link).some((segment) => /^reels?$/.test(segment)),
    thumbnail: () => undefined,
    // "/p/" serves reels and posts alike.
    embed: (id) => `https://www.instagram.com/p/${id}/embed`,
    watch: (id) => `https://www.instagram.com/p/${id}/`,
  },
};

export interface ParsedVideoLink {
  source: VideoSource;
  vertical: boolean;
}

/** Reads a link copied from the browser's address bar or a share button. */
export function parseVideoLink(text: string): ParsedVideoLink | undefined {
  let link: URL;
  try {
    link = new URL(text);
  } catch {
    return undefined;
  }
  for (const [provider, adapter] of Object.entries(adapters) as [
    VideoProvider,
    ProviderAdapter,
  ][]) {
    const id = adapter.idFrom(link);
    if (id) return { source: { provider, id }, vertical: adapter.isVertical(link) };
  }
  return undefined;
}

export const thumbnailUrl = ({ provider, id }: VideoSource) => adapters[provider].thumbnail(id);
export const embedUrl = ({ provider, id }: VideoSource) => adapters[provider].embed(id);
export const watchUrl = ({ provider, id }: VideoSource) => adapters[provider].watch(id);
