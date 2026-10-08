export interface Repo {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  isFork: boolean;
  pushedAt: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  /** GitHub's 0–4 intensity bucket. */
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionCalendar {
  total: number;
  days: ContributionDay[];
}

interface RawRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  pushed_at: string;
}

interface RawContributions {
  total: { lastYear: number };
  contributions: ContributionDay[];
}

// The unauthenticated GitHub API allows 60 requests an hour per visitor, so responses are
// cached for the session instead of refetched on every room visit.
const CACHE_PREFIX = "github-cache:";

async function fetchJsonCached<T>(url: string): Promise<T> {
  const cacheKey = CACHE_PREFIX + url;
  const cached = readSessionCache<T>(cacheKey);
  if (cached) return cached;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`GitHub request failed (${response.status}): ${url}`);
  const data = (await response.json()) as T;
  writeSessionCache(cacheKey, data);
  return data;
}

function readSessionCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeSessionCache(key: string, data: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Quota or privacy mode: the next visit just refetches.
  }
}

export function toRepo(raw: RawRepo): Repo {
  return {
    name: raw.name,
    description: raw.description,
    url: raw.html_url,
    homepage: raw.homepage || null,
    language: raw.language,
    stars: raw.stargazers_count,
    isFork: raw.fork,
    pushedAt: raw.pushed_at,
  };
}

export async function fetchRepos(username: string): Promise<Repo[]> {
  const raw = await fetchJsonCached<RawRepo[]>(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
  );
  return raw.map(toRepo);
}

/** GitHub only exposes the contribution calendar through authenticated GraphQL, so a public mirror is used. */
export async function fetchContributions(username: string): Promise<ContributionCalendar> {
  const raw = await fetchJsonCached<RawContributions>(
    `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
  );
  return { total: raw.total.lastYear, days: raw.contributions };
}
