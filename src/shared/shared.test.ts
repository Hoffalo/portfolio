import { describe, expect, it } from "vitest";
import { parseRoute, routeToHash } from "../app/route";
import { detectLocale } from "../i18n/locale";
import { embedUrl, thumbnailUrl, watchUrl } from "../services/videoSources";
import { formatPeriod } from "./formatDate";

describe("routes", () => {
  it.each([
    ["", { view: "town" }],
    ["#/", { view: "town" }],
    ["#/room/career", { view: "room", sectionId: "career" }],
    ["#/read/dev", { view: "read", sectionId: "dev" }],
    ["#/room", { view: "town" }],
    ["#/nonsense/x", { view: "town" }],
  ])("parses %s", (hash, route) => {
    expect(parseRoute(hash)).toEqual(route);
  });

  it("round-trips every route", () => {
    for (const route of [
      { view: "town" },
      { view: "room", sectionId: "videos" },
      { view: "read", sectionId: "about" },
    ] as const) {
      expect(parseRoute(routeToHash(route))).toEqual(route);
    }
  });
});

describe("detectLocale", () => {
  it("prefers Portuguese when any browser language is Portuguese", () => {
    expect(detectLocale(["es-ES", "pt-BR"])).toBe("pt");
    expect(detectLocale(["en-US"])).toBe("en");
  });
});

describe("formatPeriod", () => {
  it("uses the present label for ongoing roles", () => {
    expect(formatPeriod("2026-08", undefined, "en", "Present")).toBe("Aug 2026 – Present");
  });

  it("localises month names", () => {
    expect(formatPeriod("2024-06", "2024-08", "pt", "Presente")).toMatch(/jun.*2024.*ago.*2024/i);
  });
});

describe("video sources", () => {
  it("derives YouTube URLs from an ID", () => {
    const source = { provider: "youtube", id: "abc123" } as const;
    expect(thumbnailUrl(source)).toBe("https://i.ytimg.com/vi/abc123/hqdefault.jpg");
    expect(embedUrl(source)).toContain("youtube-nocookie.com/embed/abc123");
    expect(watchUrl(source)).toBe("https://www.youtube.com/watch?v=abc123");
  });

  it("derives Drive preview URLs from a file ID", () => {
    const source = { provider: "drive", id: "file9" } as const;
    expect(embedUrl(source)).toBe("https://drive.google.com/file/d/file9/preview");
  });

  it("uses the poster of self-hosted files as thumbnail", () => {
    expect(thumbnailUrl({ provider: "file", src: "/v.mp4", poster: "/p.jpg" })).toBe("/p.jpg");
  });
});
