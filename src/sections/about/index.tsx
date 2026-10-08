import { useMemo } from "react";
import { interests, skillGroups, spokenLanguages } from "../../content/about";
import { education } from "../../content/career";
import { profile } from "../../content/profile";
import { useLocale } from "../../i18n/LocaleContext";
import type { Exhibit, SectionDefinition } from "../types";
import { AboutPage } from "./AboutPage";
import { EducationList, InterestList, LanguageList, ProfileCard, SkillGroups } from "./AboutBlocks";
import { aboutLabels } from "./labels";

/** Furnished like a home: my portrait on the wall, a skills poster, a globe, a bookshelf, a piano. */
function useAboutExhibits(): Exhibit[] {
  const { t } = useLocale();
  return useMemo(
    () => [
      {
        id: "profile",
        label: t(aboutLabels.profile),
        caption: profile.name,
        teaser: [t(profile.headline), t(profile.location)],
        furniture: "portrait",
        image: profile.avatarUrl,
        detail: <ProfileCard />,
      },
      {
        id: "skills",
        label: t(aboutLabels.skills),
        teaser: skillGroups.map((group) => t(group.title)),
        furniture: "poster",
        detail: <SkillGroups />,
      },
      {
        id: "languages",
        label: t(aboutLabels.languages),
        teaser: spokenLanguages.map((language) => `${t(language.name)} · ${t(language.level)}`),
        furniture: "globe",
        detail: <LanguageList />,
      },
      {
        id: "education",
        label: t(aboutLabels.education),
        teaser: education.map((entry) => entry.institution),
        furniture: "bookshelf",
        detail: <EducationList />,
      },
      {
        id: "interests",
        label: t(aboutLabels.interests),
        teaser: interests.slice(0, 3).map((interest) => t(interest.title)),
        furniture: "piano",
        detail: <InterestList />,
      },
    ],
    [t],
  );
}

export const aboutSection: SectionDefinition = {
  id: "about",
  title: { en: "About", pt: "Sobre" },
  tagline: { en: "Who I am", pt: "Quem sou eu" },
  building: "residence",
  Page: AboutPage,
  useExhibits: useAboutExhibits,
};
