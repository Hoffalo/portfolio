import type { Motif } from "../../content/types";
import type { ContributionDay, Repo } from "../../services/github";

export interface RepoArrangement {
  featured: readonly string[];
  hidden: readonly string[];
  includeForks: boolean;
}

/** Featured repos first (in the configured order), then the rest by most recent push. */
export function arrangeRepos(
  repos: readonly Repo[],
  { featured, hidden, includeForks }: RepoArrangement,
): Repo[] {
  const rank = (repo: Repo) => {
    const index = featured.indexOf(repo.name);
    return index === -1 ? featured.length : index;
  };
  return repos
    .filter((repo) => !hidden.includes(repo.name) && (includeForks || !repo.isFork))
    .sort((a, b) => rank(a) - rank(b) || b.pushedAt.localeCompare(a.pushedAt));
}

export interface LanguageShare {
  language: string;
  share: number;
}

/** Share of repositories per primary language — a rough but honest picture of what I write. */
export function languageShares(repos: readonly Repo[]): LanguageShare[] {
  const counts = new Map<string, number>();
  for (const repo of repos) {
    if (repo.language) counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
  return [...counts.entries()]
    .map(([language, count]) => ({ language, share: count / total }))
    .sort((a, b) => b.share - a.share || a.language.localeCompare(b.language));
}

/**
 * Groups days into Sunday-first week columns, like GitHub's graph.
 * The first column is padded with nulls so weekdays line up across columns.
 */
export function toWeekColumns(days: readonly ContributionDay[]): (ContributionDay | null)[][] {
  if (days.length === 0) return [];
  const leadingBlanks = new Date(`${days[0]!.date}T12:00:00Z`).getUTCDay();
  const cells: (ContributionDay | null)[] = [...Array<null>(leadingBlanks).fill(null), ...days];
  const weeks: (ContributionDay | null)[][] = [];
  for (let start = 0; start < cells.length; start += 7) weeks.push(cells.slice(start, start + 7));
  return weeks;
}

const LANGUAGE_COLORS: Record<string, string> = {
  Python: "#3572A5",
  C: "#555555",
  "C#": "#178600",
  "C++": "#f34b7d",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Java: "#b07219",
  "Jupyter Notebook": "#DA5B0B",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

export const languageColor = (language: string | null) =>
  (language && LANGUAGE_COLORS[language]) || "#8b949e";

/** Keyword rules, first match wins, so a fight-prediction neural net is a punching bag, not a brain. */
const MOTIF_RULES: [RegExp, Motif][] = [
  [/plinko/, "plinko"],
  [/spotify|music|audio|song|playlist/, "jukebox"],
  [/game|arcade|unity|godot/, "arcade"],
  [/fight|ufc|mma|boxing|martial/, "punching-bag"],
  [/sewing|textile/, "sewing"],
  [/brasa|comun|community|outreach/, "megaphone"],
  [/neural|cnn|\bml\b|machine.learning|classifier|reasoning|\bai\b|_ai|ai_|llm|model/, "brain"],
  [/\.com|website|\bweb\b|portfolio|landing/, "web"],
  [/\bdb\b|_db|db_|dbproj|sql|database/, "database"],
  [/contest|competitive|leetcode|olympiad|advent/, "trophy"],
];

/**
 * Picks what a repository looks like in the dev room from its name and description, so new repos
 * get a fitting object without any configuration. `overrides` (by repo name) always wins.
 */
export function repoMotif(
  repo: Pick<Repo, "name" | "description" | "language">,
  overrides: Readonly<Record<string, Motif>> = {},
  extraText = "",
): Motif | undefined {
  const override = overrides[repo.name];
  if (override) return override;
  const text = `${repo.name} ${repo.description ?? ""} ${extraText}`.toLowerCase();
  return MOTIF_RULES.find(([pattern]) => pattern.test(text))?.[1];
}

export interface ContributionStats {
  busiest: ContributionDay | undefined;
  /** Consecutive days with commits, counting back from today (a quiet today doesn't break it). */
  streak: number;
}

export function contributionStats(days: readonly ContributionDay[]): ContributionStats {
  const busiest = days.reduce<ContributionDay | undefined>(
    (best, day) => (!best || day.count > best.count ? day : best),
    undefined,
  );
  let streak = 0;
  for (let index = days.length - 1; index >= 0; index--) {
    if (days[index]!.count > 0) streak++;
    else if (index < days.length - 1) break;
  }
  return { busiest, streak };
}
