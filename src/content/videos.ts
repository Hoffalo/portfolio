import type { Localized } from "../i18n/locale";
import type { VideoSource } from "../services/videoSources";

export interface VideoWork {
  id: string;
  title: Localized;
  client: string;
  role: Localized;
  year: number;
  /** Portrait for Shorts, Reels and vertical OOH screens. */
  orientation: "landscape" | "portrait";
  /** Without a source the piece hangs as a "coming soon" frame. */
  source?: VideoSource;
  /** Overrides the provider's auto-generated thumbnail. Put files in /public/thumbnails. */
  thumbnail?: string;
}

/**
 * The Filmmaking gallery. Newest first. Paste the ID from the video URL, for example
 * youtube.com/watch?v=dQw4w9WgXcQ becomes { provider: "youtube", id: "dQw4w9WgXcQ" }.
 * These entries are placeholders based on the CV: swap in real links as they're published.
 */
export const videos: VideoWork[] = [
  {
    id: "brasa-conference-teaser",
    title: { en: "BRASA Conference Teaser", pt: "Teaser da Conferência BRASA" },
    client: "BRASA",
    role: { en: "Director & editor", pt: "Direção e edição" },
    year: 2026,
    orientation: "landscape",
  },
  {
    id: "brasa-ensina",
    title: { en: "BRASA Ensina — Video Lessons", pt: "BRASA Ensina — Videoaulas" },
    client: "BRASA",
    role: { en: "Production lead", pt: "Líder de produção" },
    year: 2026,
    orientation: "landscape",
  },
  {
    id: "pepsico-ooh",
    title: { en: "PepsiCo OOH Spot", pt: "Peça OOH PepsiCo" },
    client: "PepsiCo",
    role: { en: "Motion designer", pt: "Motion designer" },
    year: 2025,
    orientation: "portrait",
  },
  {
    id: "botzo-devlog",
    title: { en: "Botzo Devlog", pt: "Devlog do Botzo" },
    client: "IE Robotics Lab",
    role: { en: "Editor", pt: "Edição" },
    year: 2025,
    orientation: "landscape",
  },
  {
    id: "hoffalo-short-film",
    title: { en: "Hoffalo — Short Film", pt: "Hoffalo — Curta-metragem" },
    client: "Hoffalo",
    role: { en: "Writer, director & editor", pt: "Roteiro, direção e edição" },
    year: 2024,
    orientation: "landscape",
  },
];
