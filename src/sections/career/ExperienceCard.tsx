import type { Experience } from "../../content/types";
import { useLocale } from "../../i18n/LocaleContext";
import { formatPeriod } from "../../shared/formatDate";
import { ExternalLink } from "../../ui/ExternalLink";
import { TagList } from "../../ui/TagList";

export function ExperienceCard({ experience }: { experience: Experience }) {
  const { t, ui, locale } = useLocale();
  const isOngoing = !experience.end;

  return (
    <article className="experience">
      <p className="experience__period">
        {isOngoing && <span className="live-dot" aria-hidden="true" />}
        {formatPeriod(experience.start, experience.end, locale, ui.present)}
      </p>
      <h3 className="experience__role">{t(experience.role)}</h3>
      <p className="experience__organization">{experience.organization}</p>
      {experience.location && <p className="muted">{t(experience.location)}</p>}
      <ul className="experience__highlights">
        {experience.highlights.map((highlight) => (
          <li key={highlight.en}>{t(highlight)}</li>
        ))}
      </ul>
      <TagList tags={experience.tags} />
      {experience.links?.map((link) => (
        <ExternalLink key={link.url} href={link.url}>
          {link.label}
        </ExternalLink>
      ))}
    </article>
  );
}
