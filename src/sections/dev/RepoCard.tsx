import { repoDescriptions } from "../../content/dev";
import { useLocale } from "../../i18n/LocaleContext";
import type { Repo } from "../../services/github";
import { formatDate } from "../../shared/formatDate";
import { ExternalLink } from "../../ui/ExternalLink";
import { languageColor } from "./repoModel";

export function RepoCard({ repo }: { repo: Repo }) {
  const { t, ui, locale } = useLocale();
  const curated = repoDescriptions[repo.name];
  const description = curated ? t(curated) : repo.description;

  return (
    <article className="repo">
      <h3 className="repo__name">{repo.name}</h3>
      {description && <p className="repo__description">{description}</p>}
      <p className="repo__meta">
        {repo.language && (
          <span>
            <span
              className="language-dot"
              style={{ background: languageColor(repo.language) }}
              aria-hidden="true"
            />
            {repo.language}
          </span>
        )}
        <span>
          ★ {repo.stars} <span className="sr-only">{ui.stars}</span>
        </span>
        <span>
          {ui.updated} {formatDate(repo.pushedAt, locale)}
        </span>
      </p>
      <p className="repo__links">
        <ExternalLink href={repo.url}>{ui.viewOnGitHub}</ExternalLink>
        {repo.homepage && (
          <ExternalLink href={repo.homepage}>{new URL(repo.homepage).hostname}</ExternalLink>
        )}
      </p>
    </article>
  );
}
