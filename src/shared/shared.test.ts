import { describe, expect, it } from "vitest";
import { parseRoute, routeToHash } from "../app/route";
import { detectLocale } from "../i18n/locale";
import { embedUrl, parseVideoLink, thumbnailUrl, watchUrl } from "../services/videoSources";
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

describe("parseVideoLink", () => {
  it.each([
    ["https://www.youtube.com/watch?v=abc123&t=10s", "youtube", "abc123"],
    ["https://youtu.be/abc123?si=share", "youtube", "abc123"],
    ["https://youtube.com/shorts/abc123", "youtube", "abc123"],
    ["https://m.youtube.com/watch?v=abc123", "youtube", "abc123"],
    ["https://vimeo.com/76979871", "vimeo", "76979871"],
    ["https://player.vimeo.com/video/76979871", "vimeo", "76979871"],
    ["https://drive.google.com/file/d/file9/view?usp=sharing", "drive", "file9"],
    ["https://drive.google.com/open?id=file9", "drive", "file9"],
    ["https://www.instagram.com/reel/DUT_QaYDJOk/", "instagram", "DUT_QaYDJOk"],
    ["https://www.instagram.com/p/DUT_QaYDJOk/?igsh=share", "instagram", "DUT_QaYDJOk"],
    ["https://www.instagram.com/brasa/reel/DUT_QaYDJOk/", "instagram", "DUT_QaYDJOk"],
  ])("reads %s", (link, provider, id) => {
    const parsed = parseVideoLink(link);

    expect(parsed?.source).toEqual({ provider, id });
  });

  it.each([
    "https://www.youtube.com/@hoffalo",
    "https://www.instagram.com/hoffalo/",
    "https://example.com/watch?v=abc",
    "not a link",
  ])(
    "rejects %s, which isn't a video",
    (link) => {
      expect(parseVideoLink(link)).toBeUndefined();
    },
  );

  it("recognises YouTube Shorts as vertical", () => {
    expect(parseVideoLink("https://youtube.com/shorts/abc123")?.vertical).toBe(true);
  });

  it("recognises Instagram Reels as vertical, but not other posts", () => {
    expect(parseVideoLink("https://www.instagram.com/reel/abc123/")?.vertical).toBe(true);
    expect(parseVideoLink("https://www.instagram.com/p/abc123/")?.vertical).toBe(false);
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
    expect(embedUrl({ provider: "drive", id: "file9" })).toBe(
      "https://drive.google.com/file/d/file9/preview",
    );
  });

  it("derives Instagram embed URLs, with no thumbnail to fall back on", () => {
    const source = { provider: "instagram", id: "abc123" } as const;

    expect(embedUrl(source)).toBe("https://www.instagram.com/p/abc123/embed");
    expect(watchUrl(source)).toBe("https://www.instagram.com/p/abc123/");
    expect(thumbnailUrl(source)).toBeUndefined();
  });
});
