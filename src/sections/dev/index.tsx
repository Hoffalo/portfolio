import { useMemo } from "react";
import { featuredRepos, hiddenRepos, repoDescriptions, repoMotifs } from "../../content/dev";
import { GITHUB_USERNAME } from "../../content/profile";
import { useLocale } from "../../i18n/LocaleContext";
import type { ContributionDay } from "../../services/github";
import { formatDate } from "../../shared/formatDate";
import type { Exhibit, SectionDefinition } from "../types";
import { ContributionGraph } from "./ContributionGraph";
import { DevPage } from "./DevPage";
import { GitHubHeader } from "./GitHubHeader";
import { LanguageBar } from "./LanguageBar";
import { RepoCard } from "./RepoCard";
import { devLabels } from "./labels";
import {
  arrangeRepos,
  contributionStats,
  languageColor,
  languageShares,
  repoMotif,
  toWeekColumns,
} from "./repoModel";
import { useContributions, useGitHubRepos } from "./useGitHub";

const shorten = (text: string, length: number) =>
  text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text;

/**
 * A server room (or a wizard's library): a year of commits stitched or lit up on a display by the
 * entrance, and one piece per repository, shaped like its subject and marked with its language colour.
 */
function useDevExhibits(): Exhibit[] {
  const { t, ui, locale } = useLocale();
  const repos = useGitHubRepos();
  const contributions = useContributions();

  return useMemo(() => {
    const activityTeaser = (days: readonly ContributionDay[]) => {
      const { busiest, streak } = contributionStats(days);
      return [
        ...(busiest?.count
          ? [`${t(devLabels.busiestDay)}: ${busiest.count} · ${formatDate(busiest.date, locale)}`]
          : []),
        `${t(devLabels.streak)}: ${streak} ${t(devLabels.days)}`,
      ];
    };

    if (repos.status !== "ready") {
      return [
        {
          id: "status",
          label: repos.status === "loading" ? ui.loading : ui.loadFailed,
          furniture: "console",
          href: `https://github.com/${GITHUB_USERNAME}`,
        },
      ];
    }

    const activity: Exhibit[] =
      contributions.status === "ready"
        ? [
            {
              id: "activity",
              label: t(devLabels.activity),
              caption: `${contributions.data.total} ${ui.contributionsLastYear}`,
              teaser: activityTeaser(contributions.data.days),
              furniture: "contributions",
              // Week columns flattened for the wall; -1 pads the first week so weekdays line up.
              levels: toWeekColumns(contributions.data.days).flatMap((week) =>
                Array.from({ length: 7 }, (_, day) => week[day]?.level ?? -1),
              ),
              detail: (
                <>
                  <GitHubHeader repos={repos.data} />
                  <ContributionGraph calendar={contributions.data} />
                </>
              ),
            },
          ]
        : [];

    const shares = languageShares(repos.data);
    const stack: Exhibit = {
      id: "stack",
      label: t(devLabels.stack),
      teaser: shares
        .slice(0, 3)
        .map(({ language, share }) => `${language} · ${Math.round(share * 100)}%`),
      furniture: "console",
      detail: <LanguageBar repos={repos.data} />,
    };

    // Forks are mostly course templates, so the room only shows original work.
    const racks = arrangeRepos(repos.data, {
      featured: featuredRepos,
      hidden: hiddenRepos,
      includeForks: false,
    }).map((repo): Exhibit => {
      const curated = repoDescriptions[repo.name];
      const description = curated ? t(curated) : repo.description;
      return {
        id: `repo-${repo.name}`,
        label: repo.name,
        teaser: [
          [repo.language, repo.stars > 0 ? `★ ${repo.stars}` : null].filter(Boolean).join(" · "),
          ...(description ? [shorten(description, 70)] : []),
        ].filter(Boolean),
        furniture: "rack",
        // Each project looks like its subject; the gem or light beside it shows the language.
        motif: repoMotif(repo, repoMotifs, curated?.en),
        accent: languageColor(repo.language),
        detail: <RepoCard repo={repo} />,
      };
    });

    return [...activity, stack, ...racks];
  }, [repos, contributions, t, ui, locale]);
}

export const devSection: SectionDefinition = {
  id: "dev",
  title: { en: "Dev", pt: "Dev" },
  tagline: { en: "Code & contributions", pt: "Código & contribuições" },
  building: "datacenter",
  Page: DevPage,
  useExhibits: useDevExhibits,
};
