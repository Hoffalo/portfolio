import type { CSSProperties } from "react";
import { useLocale } from "../../i18n/LocaleContext";
import type { ContributionCalendar } from "../../services/github";
import { formatDate } from "../../shared/formatDate";
import { toWeekColumns } from "./repoModel";

export function ContributionGraph({ calendar }: { calendar: ContributionCalendar }) {
  const { ui, locale } = useLocale();
  const weeks = toWeekColumns(calendar.days);

  return (
    <figure className="contributions">
      <div
        className="contributions__grid"
        style={{ "--weeks": weeks.length } as CSSProperties}
        role="img"
        aria-label={`${calendar.total} ${ui.contributionsLastYear}`}
      >
        {weeks.flatMap((week, column) =>
          week.map((day, row) =>
            day ? (
              <span
                key={day.date}
                className="contributions__cell"
                data-level={day.level}
                style={{ gridColumn: column + 1, gridRow: row + 1 }}
                title={`${day.count} · ${formatDate(day.date, locale)}`}
              />
            ) : null,
          ),
        )}
      </div>
      <figcaption className="contributions__caption">
        <strong>{calendar.total}</strong> {ui.contributionsLastYear}
      </figcaption>
    </figure>
  );
}
