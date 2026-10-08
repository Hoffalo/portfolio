import { useId, useState } from "react";
import { featuredRepos, hiddenRepos } from "../../content/dev";
import { useLocale } from "../../i18n/LocaleContext";
import type { Repo } from "../../services/github";
import { RepoCard } from "./RepoCard";
import { arrangeRepos } from "./repoModel";

export function RepoBrowser({ repos }: { repos: readonly Repo[] }) {
  const { ui } = useLocale();
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [includeForks, setIncludeForks] = useState(false);

  const needle = query.trim().toLowerCase();
  const visible = arrangeRepos(repos, {
    featured: featuredRepos,
    hidden: hiddenRepos,
    includeForks,
  }).filter(
    (repo) =>
      !needle ||
      `${repo.name} ${repo.description ?? ""} ${repo.language ?? ""}`
        .toLowerCase()
        .includes(needle),
  );

  return (
    <div className="repo-browser">
      <div className="repo-browser__filters">
        <label className="sr-only" htmlFor={searchId}>
          {ui.searchRepos}
        </label>
        <input
          id={searchId}
          className="input"
          type="search"
          placeholder={ui.searchRepos}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <label className="checkbox">
          <input
            type="checkbox"
            checked={includeForks}
            onChange={(event) => setIncludeForks(event.target.checked)}
          />
          {ui.showForks}
        </label>
      </div>
      {visible.length === 0 ? (
        <p className="status">{ui.noRepos}</p>
      ) : (
        <ul className="repo-grid">
          {visible.map((repo) => (
            <li key={repo.name}>
              <RepoCard repo={repo} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
