import { useSyncExternalStore } from "react";
import { thumbnailUrl } from "../../services/videoSources";
import { applyRuleFor, type RulesByKind } from "./catalog/byKind";
import type { ShelfItem, VideoWork } from "./catalog/types";

/** Far enough in to skip a fade from black, close enough to the start to load quickly. */
const FRAME_AT_SECONDS = 1;
const FRAME_WIDTH = 640;

export type ThumbnailLookup = (item: ShelfItem) => string | undefined;

/**
 * Proxy for thumbnails. Asking for one is cheap and always answers immediately: a poster image,
 * then the hosting provider's thumbnail, and for plain video files a frame captured from the
 * video itself. Capturing means downloading part of the video, so it only starts the first time a
 * thumbnail is asked for, and its result is cached. Observers hear when a capture finishes, so
 * paintings and tiles can swap their placeholder for the frame.
 */
class ThumbnailProxy {
  private readonly frames = new Map<string, string | undefined>();
  private readonly listeners = new Set<() => void>();
  private lookup: ThumbnailLookup = (item) => this.thumbnailOf(item);

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** A new function after every capture, which is how React knows to re-render. */
  getLookup = () => this.lookup;

  private readonly rules: RulesByKind<string | undefined> = {
    video: (video) => this.videoThumbnail(video),
    collection: (collection) =>
      collection.cover ??
      collection.videos.map((video) => this.videoThumbnail(video)).find(Boolean),
    link: (link) => link.thumbnail,
  };

  private thumbnailOf(item: ShelfItem): string | undefined {
    return applyRuleFor(this.rules, item);
  }

  private videoThumbnail(video: VideoWork): string | undefined {
    const known = video.poster ?? thumbnailUrl(video.source);
    if (known || video.source.provider !== "file") return known;
    return this.capturedFrame(video.source.src);
  }

  private capturedFrame(src: string): string | undefined {
    if (!this.frames.has(src)) {
      this.frames.set(src, undefined);
      captureFrame(src).then(
        (frame) => {
          this.frames.set(src, frame);
          this.notify();
        },
        // The tile keeps its placeholder; retrying on every render would refetch the video.
        (error: unknown) => console.warn("[videos] No thumbnail captured:", error),
      );
    }
    return this.frames.get(src);
  }

  private notify() {
    this.lookup = (item) => this.thumbnailOf(item);
    for (const listener of this.listeners) listener();
  }
}

function captureFrame(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.preload = "auto";
    video.addEventListener(
      "loadedmetadata",
      () => (video.currentTime = Math.min(FRAME_AT_SECONDS, video.duration / 2)),
      { once: true },
    );
    video.addEventListener(
      "seeked",
      () => {
        const canvas = document.createElement("canvas");
        canvas.width = Math.min(FRAME_WIDTH, video.videoWidth);
        canvas.height = Math.round((canvas.width / video.videoWidth) * video.videoHeight);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("No 2D canvas to capture a frame on"));
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
        // Releases the download; the browser would otherwise keep buffering the video.
        video.removeAttribute("src");
        video.load();
      },
      { once: true },
    );
    video.addEventListener("error", () => reject(new Error(`Can't load ${src}`)), { once: true });
    video.src = src;
  });
}

const thumbnails = new ThumbnailProxy();

/** The best thumbnail for each shelf item, updating as captured frames arrive. */
export function useThumbnails(): ThumbnailLookup {
  return useSyncExternalStore(thumbnails.subscribe, thumbnails.getLookup);
}
