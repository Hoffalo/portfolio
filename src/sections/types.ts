import type { ComponentType, ReactNode } from "react";
import type { Motif } from "../content/types";
import type { Localized } from "../i18n/locale";

/** The building that represents a section in the town. Each theme draws every kind its own way. */
export type BuildingKind = "residence" | "corporate" | "datacenter" | "theater";

/**
 * The object an exhibit appears as inside a room. Each theme draws its own version,
 * e.g. a "rack" is a blinking server rack in the city and a bookcase of tomes in the kingdom.
 */
export type FurnitureKind =
  | "painting-wide"
  | "painting-tall"
  | "screen"
  | "poster"
  | "portrait"
  | "desk"
  | "rack"
  | "bookshelf"
  | "globe"
  | "piano"
  | "console"
  /** A wide standing display, by the entrance, that draws a contribution calendar from `levels`. */
  | "contributions";

export type { Motif };

export interface Exhibit {
  id: string;
  /** Already localized; titles the dialog box and labels the object for screen readers. */
  label: string;
  furniture: FurnitureKind;
  /** Short name on the plaque beside the object, e.g. a company or repo name. Defaults to `label`. */
  caption?: string;
  /** A few short lines previewed above the object when the visitor walks up to it. */
  teaser?: string[];
  /** Shown in the dialog box when the visitor interacts. Without it, `href` opens instead. */
  detail?: ReactNode;
  href?: string;
  /** Picture drawn onto paintings, screens and portraits. */
  image?: string;
  /** Tints the object so similar pieces stay distinguishable (a company's colour, a repo's language). */
  accent?: string;
  /** Dresses the piece for its subject; see `Motif`. */
  motif?: Motif;
  /** Marks the piece as current, e.g. an ongoing role: its candle is lit, its monitor is on. */
  lit?: boolean;
  /** Intensities from 0 to 4, oldest first, for data-driven pieces such as the contribution wall. */
  levels?: readonly number[];
}

/**
 * A portfolio section. Registering one adds a building to the town, a room behind it,
 * and a page in boring mode — nothing else needs to change.
 */
export interface SectionDefinition {
  id: string;
  title: Localized;
  tagline: Localized;
  building: BuildingKind;
  /** Boring-mode page. */
  Page: ComponentType;
  /** Room contents. A hook so sections can load data (e.g. GitHub) and react to the locale. */
  useExhibits: () => Exhibit[];
}
