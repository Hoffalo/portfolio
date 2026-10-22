/** A video on a streaming platform, identified by the ID in its URL. */
export type HostedVideoSource =
  | { provider: "youtube"; id: string }
  | { provider: "vimeo"; id: string }
  | { provider: "drive"; id: string };

/**
 * Where a video lives. Each provider adapts its own URL scheme to one interface (thumbnail,
 * embeddable player, public page), so the rest of the site never needs to know which one it is.
 */
export type VideoSource = HostedVideoSource | { provider: "file"; src: string };

export const HOSTED_PROVIDERS: readonly HostedVideoSource["provider"][] = [
  "youtube",
  "vimeo",
  "drive",
];

interface ProviderAdapter<S extends VideoSource> {
  thumbnail(source: S): string | undefined;
  embed(source: S): string;
  watch(source: S): string;
}

type Adapters = {
  [P in VideoSource["provider"]]: ProviderAdapter<Extract<VideoSource, { provider: P }>>;
};

const adapters: Adapters = {
  youtube: {
    thumbnail: ({ id }) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    // The privacy-enhanced domain avoids setting tracking cookies until the visitor presses play.
    embed: ({ id }) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
    watch: ({ id }) => `https://www.youtube.com/watch?v=${id}`,
  },
  vimeo: {
    thumbnail: ({ id }) => `https://vumbnail.com/${id}.jpg`,
    embed: ({ id }) => `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`,
    watch: ({ id }) => `https://vimeo.com/${id}`,
  },
  drive: {
    // Only works for files shared as "Anyone with the link".
    thumbnail: ({ id }) => `https://drive.google.com/thumbnail?id=${id}&sz=w800`,
    embed: ({ id }) => `https://drive.google.com/file/d/${id}/preview`,
    watch: ({ id }) => `https://drive.google.com/file/d/${id}/view`,
  },
  file: {
    // A plain file has no thumbnail service; the videos section captures a frame instead.
    thumbnail: () => undefined,
    embed: ({ src }) => src,
    watch: ({ src }) => src,
  },
};

function adapterFor<S extends VideoSource>(source: S) {
  return adapters[source.provider] as ProviderAdapter<S>;
}

export const thumbnailUrl = (source: VideoSource) => adapterFor(source).thumbnail(source);
export const embedUrl = (source: VideoSource) => adapterFor(source).embed(source);
export const watchUrl = (source: VideoSource) => adapterFor(source).watch(source);
