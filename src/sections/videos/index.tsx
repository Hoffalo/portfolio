import { useMemo } from "react";
import type { Exhibit, SectionDefinition } from "../types";
import { useVideoShelf } from "./useVideoShelf";
import { VideoPage } from "./VideoPage";

/** A screening gallery: every video, collection and link hangs on the wall showing its thumbnail. */
function useVideoExhibits(): Exhibit[] {
  const shelf = useVideoShelf();
  return useMemo(() => shelf.map(({ exhibit }) => exhibit), [shelf]);
}

export const videosSection: SectionDefinition = {
  id: "videos",
  title: { en: "Filmmaking", pt: "Filmmaking" },
  tagline: { en: "Video editing & motion", pt: "Edição de vídeo & motion" },
  building: "theater",
  Page: VideoPage,
  useExhibits: useVideoExhibits,
};
