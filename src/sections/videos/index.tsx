import { useMemo } from "react";
import { videos } from "../../content/videos";
import { useLocale } from "../../i18n/LocaleContext";
import type { Exhibit, SectionDefinition } from "../types";
import { VideoCredits, VideoPlayer } from "./VideoMedia";
import { VideoPage } from "./VideoPage";
import { videoThumbnail } from "./videoThumbnail";

/** A screening gallery: every video hangs on the wall as a painting (or LED frame) showing its thumbnail. */
function useVideoExhibits(): Exhibit[] {
  const { t, ui } = useLocale();
  return useMemo(
    () =>
      videos.map((video) => ({
        id: video.id,
        label: t(video.title),
        teaser: [
          `${video.client} · ${video.year}`,
          t(video.role),
          ...(video.source ? [] : [ui.comingSoon]),
        ],
        furniture: video.orientation === "portrait" ? "painting-tall" : "painting-wide",
        image: videoThumbnail(video),
        detail: (
          <>
            <VideoPlayer video={video} />
            <VideoCredits video={video} />
          </>
        ),
      })),
    [t, ui],
  );
}

export const videosSection: SectionDefinition = {
  id: "videos",
  title: { en: "Filmmaking", pt: "Filmmaking" },
  tagline: { en: "Video editing & motion", pt: "Edição de vídeo & motion" },
  building: "theater",
  Page: VideoPage,
  useExhibits: useVideoExhibits,
};
