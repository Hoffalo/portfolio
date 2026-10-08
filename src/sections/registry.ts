import { aboutSection } from "./about";
import { careerSection } from "./career";
import { devSection } from "./dev";
import type { SectionDefinition } from "./types";
import { videosSection } from "./videos";

/**
 * The portfolio's sections, in street order. To add one, create a folder next to these
 * that exports a SectionDefinition and list it here.
 */
export const sections: readonly SectionDefinition[] = [
  aboutSection,
  careerSection,
  devSection,
  videosSection,
];

export const findSection = (id: string) => sections.find((section) => section.id === id);
