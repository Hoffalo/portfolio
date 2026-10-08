import { describe, expect, it } from "vitest";
import { toRepo, type Repo } from "../../services/github";
import {
  arrangeRepos,
  contributionStats,
  languageShares,
  repoMotif,
  toWeekColumns,
} from "./repoModel";

const repo = (name: string, overrides: Partial<Repo> = {}): Repo => ({
  name,
  description: null,
  url: `https://github.com/x/${name}`,
  homepage: null,
  language: "Python",
  stars: 0,
  isFork: false,
  pushedAt: "2026-01-01T00:00:00Z",
  ...overrides,
});

describe("arrangeRepos", () => {
  const repos = [
    repo("old", { pushedAt: "2025-01-01T00:00:00Z" }),
    repo("new", { pushedAt: "2026-06-01T00:00:00Z" }),
    repo("star"),
    repo("fork", { isFork: true }),
    repo("secret"),
  ];

  it("puts featured first, then newest, and drops hidden repos and forks", () => {
    const names = arrangeRepos(repos, {
      featured: ["star"],
      hidden: ["secret"],
      includeForks: false,
    }).map((r) => r.name);
    expect(names).toEqual(["star", "new", "old"]);
  });

  it("includes forks on request", () => {
    const names = arrangeRepos(repos, { featured: [], hidden: [], includeForks: true }).map(
      (r) => r.name,
    );
    expect(names).toContain("fork");
  });
});

describe("languageShares", () => {
  it("ignores repos without a language and sorts by share", () => {
    const shares = languageShares([
      repo("a"),
      repo("b"),
      repo("c", { language: "C" }),
      repo("d", { language: null }),
    ]);
    expect(shares.map((s) => s.language)).toEqual(["Python", "C"]);
    expect(shares[0]!.share).toBeCloseTo(2 / 3);
  });
});

describe("toWeekColumns", () => {
  it("pads the first week so weekdays line up (2026-10-07 is a Wednesday)", () => {
    const weeks = toWeekColumns([
      { date: "2026-10-07", count: 1, level: 1 },
      { date: "2026-10-08", count: 0, level: 0 },
    ]);
    expect(weeks[0]!.slice(0, 3)).toEqual([null, null, null]);
    expect(weeks[0]![3]?.date).toBe("2026-10-07");
  });

  it("returns no weeks for no days", () => {
    expect(toWeekColumns([])).toEqual([]);
  });
});

describe("toRepo", () => {
  it("normalises empty homepages to null", () => {
    const mapped = toRepo({
      name: "x",
      description: null,
      html_url: "u",
      homepage: "",
      language: null,
      stargazers_count: 2,
      fork: false,
      pushed_at: "t",
    });
    expect(mapped).toMatchObject({ homepage: null, stars: 2, isFork: false });
  });
});

describe("repoMotif", () => {
  it("dresses each repo as its subject, first matching rule wins", () => {
    expect(repoMotif(repo("ads-plinko"))).toBe("plinko");
    expect(repoMotif(repo("spotifyclassifier"))).toBe("jukebox");
    expect(repoMotif(repo("Game-Project"))).toBe("arcade");
    expect(repoMotif(repo("fight-matchmaker", { description: "Neural network for UFC" }))).toBe(
      "punching-bag",
    );
    expect(repoMotif(repo("sewing_dbproj"))).toBe("sewing");
    expect(repoMotif(repo("comp_prog_cnn_proj"))).toBe("brain");
    expect(repoMotif(repo("hoffalo.com"))).toBe("web");
  });

  it("falls back to a plain rack, and lets overrides win", () => {
    expect(repoMotif(repo("dotfiles"))).toBeUndefined();
    expect(repoMotif(repo("dotfiles"), { dotfiles: "trophy" })).toBe("trophy");
  });
});

describe("contributionStats", () => {
  const day = (date: string, count: number) => ({ date, count, level: 0 as const });
  it("finds the busiest day and the streak up to today, forgiving a quiet today", () => {
    const stats = contributionStats([
      day("2026-01-01", 9),
      day("2026-01-02", 0),
      day("2026-01-03", 2),
      day("2026-01-04", 4),
      day("2026-01-05", 0),
    ]);
    expect(stats.busiest?.date).toBe("2026-01-01");
    expect(stats.streak).toBe(2);
  });
});
