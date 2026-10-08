import { GITHUB_USERNAME, profile } from "../../content/profile";
import { useLocale } from "../../i18n/LocaleContext";
import type { Repo } from "../../services/github";
import { ExternalLink } from "../../ui/ExternalLink";

export function GitHubHeader({ repos }: { repos: readonly Repo[] }) {
  const { ui } = useLocale();
  const ownRepos = repos.filter((repo) => !repo.isFork).length;
  return (
    <header className="github-header">
      <img className="avatar avatar--small" src={profile.avatarUrl} alt="" width={56} height={56} />
      <div>
        <h3 className="github-header__name">@{GITHUB_USERNAME}</h3>
        <p className="muted">
          {ownRepos} {ui.repositories}
        </p>
      </div>
      <ExternalLink href={`https://github.com/${GITHUB_USERNAME}`}>{ui.viewOnGitHub}</ExternalLink>
    </header>
  );
}
