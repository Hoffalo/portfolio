/**
 * Where a video is hosted. Each provider knows how to derive a thumbnail, an embeddable
 * player URL and a public watch URL from just an ID, so the content file stays one line per video.
 */
export type VideoSource =
  | { provider: "youtube"; id: string }
  | { provider: "vimeo"; id: string }
  | { provider: "drive"; id: string }
  | { provider: "file"; src: string; poster?: string };

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
    thumbnail: ({ poster }) => poster,
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
