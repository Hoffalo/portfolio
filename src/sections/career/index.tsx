import { useMemo } from "react";
import { experiences } from "../../content/career";
import { useLocale } from "../../i18n/LocaleContext";
import { formatPeriod } from "../../shared/formatDate";
import type { Exhibit, SectionDefinition } from "../types";
import { CareerPage } from "./CareerPage";
import { careerTracks } from "./careerModel";
import { ExperienceCard } from "./ExperienceCard";

/**
 * An office floor laid out as a timeline: one desk per organisation, oldest first, flying its colours
 * with a prop that hints at the work. Promotions share a desk; ongoing roles keep a light on.
 */
function useCareerExhibits(): Exhibit[] {
  const { t, ui, locale } = useLocale();
  return useMemo(
    () =>
      careerTracks(experiences).map(({ organization, roles }): Exhibit => {
        const first = roles[0]!;
        const latest = roles[roles.length - 1]!;
        const titles = roles.map((role) => t(role.role)).join(" → ");
        return {
          id: first.id,
          label: roles.length > 1 ? `${organization}: ${titles}` : `${titles} — ${organization}`,
          caption: organization.split(" — ")[0],
          teaser: [
            titles,
            formatPeriod(first.start, latest.end, locale, ui.present),
            ...(latest.location ? [t(latest.location)] : []),
          ],
          furniture: "desk",
          accent: latest.accent,
          motif: latest.motif,
          lit: !latest.end,
          // Newest role first, as on a CV.
          detail: (
            <>
              {[...roles].reverse().map((role) => (
                <ExperienceCard key={role.id} experience={role} />
              ))}
            </>
          ),
        };
      }),
    [t, ui, locale],
  );
}

export const careerSection: SectionDefinition = {
  id: "career",
  title: { en: "Career", pt: "Carreira" },
  tagline: { en: "Where I've worked", pt: "Onde trabalhei" },
  building: "corporate",
  Page: CareerPage,
  useExhibits: useCareerExhibits,
};
