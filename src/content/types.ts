import type { Localized } from "../i18n/locale";

/** "YYYY-MM". Months keep the timeline sortable without timezone surprises. */
export type YearMonth = `${number}-${number}`;

export interface SocialLink {
  id: "github" | "linkedin" | "instagram" | "youtube";
  label: string;
  url: string;
}

export interface Profile {
  name: string;
  headline: Localized;
  location: Localized;
  email: string;
  avatarUrl: string;
  bio: Localized[];
  links: SocialLink[];
}

export interface Experience {
  id: string;
  organization: string;
  /** The organisation's brand colour; tints its desk in the career room. */
  accent?: string;
  /** The prop beside its desk in the career room, hinting at the work (a camera, a stock chart…). */
  motif?: Motif;
  role: Localized;
  start: YearMonth;
  /** Omitted while the role is ongoing. */
  end?: YearMonth;
  location?: Localized;
  highlights: Localized[];
  tags: string[];
  links?: { label: string; url: string }[];
}

export interface Education {
  id: string;
  institution: string;
  credential: Localized;
  location: Localized;
  startYear: number;
  endYear: number;
  details?: Localized[];
}

export interface SkillGroup {
  id: string;
  title: Localized;
  skills: Localized[];
}

export interface SpokenLanguage {
  name: Localized;
  level: Localized;
  /** 0–1, drives the proficiency bar. */
  fluency: number;
}

export interface Interest {
  id: string;
  title: Localized;
  description: Localized;
  url?: string;
}

/**
 * What a piece is about, so it looks like its subject: a repo about music becomes a jukebox, a job
 * in finance gets a stock chart beside its desk. Each theme draws its own version of every motif.
 */
export type Motif =
  // Projects, standing in for a server rack.
  | "arcade"
  | "web"
  | "brain"
  | "jukebox"
  | "trophy"
  | "punching-bag"
  | "sewing"
  | "plinko"
  | "megaphone"
  | "database"
  // Jobs, standing beside a desk.
  | "camera"
  | "chart"
  | "robot"
  | "clapper"
  | "palette"
  | "podium";
