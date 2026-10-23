import { describe, expect, it } from "vitest";
import type { ShelfItem, VideoCollection, VideoWork } from "./types";
import { VideoCatalogBuilder } from "./VideoCatalogBuilder";

const YOUTUBE = "https://www.youtube.com/watch?v=abc";
const imageUrl = (path: string) => `/assets/${path}`;

function catalogOf(json: Record<string, unknown>, images: string[] = []) {
  const builder = new VideoCatalogBuilder();
  for (const path of images) builder.addImage(path, imageUrl(path));
  for (const [path, content] of Object.entries(json)) builder.addJson(path, content);
  return builder.build();
}

const first = <T extends ShelfItem>(items: readonly ShelfItem[]) => items[0] as T;

describe("VideoCatalogBuilder", () => {
  it("makes a file with a list of videos a collection, and any other file a video", () => {
    const json = {
      "brasa.json": { videos: [{ title: "Teaser", url: YOUTUBE }] },
      "showreel.json": { url: YOUTUBE },
    };

    const { items } = catalogOf(json);

    expect(items.map((item) => item.kind)).toEqual(["collection", "video"]);
  });

  it("orders the shelf by file name, numbers first", () => {
    const json = { "10-late.json": { url: YOUTUBE }, "2-early.json": { url: YOUTUBE } };

    const { items } = catalogOf(json);

    expect(items.map((item) => item.id)).toEqual(["2-early.json", "10-late.json"]);
  });

  it("keeps a collection's videos in the order they are written", () => {
    const json = {
      "brasa.json": {
        videos: [
          { title: "Zebra", url: YOUTUBE },
          { title: "Apple", url: YOUTUBE },
        ],
      },
    };

    const collection = first<VideoCollection>(catalogOf(json).items);

    expect(collection.videos.map((video) => video.title.en)).toEqual(["Zebra", "Apple"]);
  });

  it("titles a file from its name, without the ordering number, when it has no title", () => {
    const video = first<VideoWork>(
      catalogOf({ "03-conference_teaser.json": { url: YOUTUBE } }).items,
    );

    expect(video.title).toEqual({ en: "Conference teaser", pt: "Conference teaser" });
  });

  it("reads separate titles and descriptions for each language", () => {
    const json = {
      "reel.json": { url: YOUTUBE, title: { en: "Reel", pt: "Rolo" }, description: "One day" },
    };

    const video = first<VideoWork>(catalogOf(json).items);

    expect(video).toMatchObject({
      title: { en: "Reel", pt: "Rolo" },
      description: { en: "One day", pt: "One day" },
    });
  });

  it("plays the video the link points to", () => {
    const video = first<VideoWork>(catalogOf({ "reel.json": { url: YOUTUBE } }).items);

    expect(video.source).toEqual({ provider: "youtube", id: "abc" });
  });

  it("shows a YouTube Short upright unless told otherwise", () => {
    const json = { "short.json": { url: "https://youtube.com/shorts/xyz" } };

    const video = first<VideoWork>(catalogOf(json).items);

    expect(video.orientation).toBe("portrait");
  });

  it("uses the provider's thumbnail when none is given", () => {
    const video = first<VideoWork>(catalogOf({ "reel.json": { url: YOUTUBE } }).items);

    expect(video.thumbnail).toBe("https://i.ytimg.com/vi/abc/hqdefault.jpg");
  });

  it("prefers a thumbnail image from the videos folder", () => {
    const json = { "reel.json": { url: YOUTUBE, thumbnail: "thumbnails/reel.jpg" } };

    const video = first<VideoWork>(catalogOf(json, ["thumbnails/reel.jpg"]).items);

    expect(video.thumbnail).toBe(imageUrl("thumbnails/reel.jpg"));
  });

  it("gives a collection without a thumbnail its first video's", () => {
    const json = { "brasa.json": { videos: [{ title: "Teaser", url: YOUTUBE }] } };

    const collection = first<VideoCollection>(catalogOf(json).items);

    expect(collection.thumbnail).toBe("https://i.ytimg.com/vi/abc/hqdefault.jpg");
  });

  it("hides a collection that has no videos yet", () => {
    const { items, problems } = catalogOf({ "brasa.json": { title: "BRASA", videos: [] } });

    expect(items).toEqual([]);
    expect(problems).toEqual([]);
  });

  it.each([
    ["no url", { title: "Teaser" }, '"url" must be'],
    ["a link that isn't a video", { title: "Teaser", url: "https://example.com" }, '"url" must be'],
    ["no title", { url: YOUTUBE }, 'needs a "title"'],
  ])("skips and reports a collection video with %s", (_, video, field) => {
    const json = { "brasa.json": { videos: [video, { title: "Fine", url: YOUTUBE }] } };

    const { items, problems } = catalogOf(json);

    expect((items[0] as VideoCollection).videos).toHaveLength(1);
    expect(problems).toEqual([expect.stringContaining(`brasa.json, video 1: ${field}`)]);
  });

  it("reports a thumbnail that isn't in the videos folder", () => {
    const { problems } = catalogOf({ "reel.json": { url: YOUTUBE, thumbnail: "missing.jpg" } });

    expect(problems).toEqual([expect.stringContaining('"missing.jpg" was not found')]);
  });

  it("puts links after the videos, in the order they are written", () => {
    const json = {
      "links.json": [
        { title: "YouTube", url: "https://youtube.com/@me" },
        { title: "Vimeo", url: "https://vimeo.com/me" },
      ],
      "reel.json": { url: YOUTUBE },
    };

    const { items } = catalogOf(json);

    expect(items.map((item) => item.title.en)).toEqual(["Reel", "YouTube", "Vimeo"]);
  });

  it.each([
    ["no url", { title: "YouTube" }],
    ["a url that isn't a web address", { title: "YouTube", url: "youtube" }],
    ["no title", { url: "https://youtube.com" }],
  ])("reports a link with %s", (_, entry) => {
    const { items, problems } = catalogOf({ "links.json": [entry] });

    expect(items).toEqual([]);
    expect(problems).toEqual([expect.stringContaining("entry 1")]);
  });
});
