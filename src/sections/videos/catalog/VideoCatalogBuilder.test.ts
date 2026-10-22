import { describe, expect, it } from "vitest";
import type { ShelfItem, VideoCollection, VideoWork } from "./types";
import { VideoCatalogBuilder } from "./VideoCatalogBuilder";

const url = (path: string) => `/assets/${path}`;

function catalogOf(files: string[], json: Record<string, unknown> = {}) {
  const builder = new VideoCatalogBuilder();
  for (const path of files) builder.addFile(path, url(path));
  for (const [path, data] of Object.entries(json)) builder.addJson(path, data);
  return builder.build();
}

const ids = (items: readonly ShelfItem[]) => items.map((item) => item.id);
const only = <T extends ShelfItem>(items: readonly ShelfItem[]) => items[0] as T;

describe("VideoCatalogBuilder", () => {
  it("turns each folder into a collection and keeps top-level videos on their own", () => {
    const files = ["brasa/teaser.mp4", "brasa/promo.mp4", "showreel.mp4"];

    const { items } = catalogOf(files);

    expect(items.map((item) => item.kind)).toEqual(["collection", "video"]);
  });

  it("orders the shelf and each collection by name, numbers first", () => {
    const files = [
      "10-late.mp4",
      "2-early.mp4",
      "brasa/2-b.mp4",
      "brasa/10-c.mp4",
      "1-first/a.mp4",
    ];

    const { items } = catalogOf(files);

    expect(ids(items)).toEqual(["1-first", "2-early", "10-late", "brasa"]);
    expect(ids((items[3] as VideoCollection).videos)).toEqual(["brasa/2-b", "brasa/10-c"]);
  });

  it("titles videos and collections from their names, without the ordering number", () => {
    const { items } = catalogOf(["03-brasa_ensina/01-conference-teaser.mp4"]);

    const collection = only<VideoCollection>(items);

    expect(collection.title.en).toBe("Brasa ensina");
    expect(collection.videos[0]!.title.en).toBe("Conference teaser");
  });

  it("takes title, description and orientation from the video's JSON file", () => {
    const json = {
      "reel.json": {
        title: { en: "Reel", pt: "Rolo" },
        description: "Shot in a day",
        orientation: "portrait",
      },
    };

    const video = only<VideoWork>(catalogOf(["reel.mp4"], json).items);

    expect(video).toMatchObject({
      title: { en: "Reel", pt: "Rolo" },
      description: { en: "Shot in a day", pt: "Shot in a day" },
      orientation: "portrait",
    });
  });

  it("uses an image with the video's name as its poster", () => {
    const video = only<VideoWork>(catalogOf(["reel.mp4", "reel.jpg"]).items);

    expect(video.poster).toBe(url("reel.jpg"));
  });

  it("plays a hosted video declared by a JSON file alone", () => {
    const json = { "devlog.json": { source: { provider: "youtube", id: "abc" } } };

    const video = only<VideoWork>(catalogOf([], json).items);

    expect(video.source).toEqual({ provider: "youtube", id: "abc" });
  });

  it("reports a JSON file with neither a video next to it nor a source", () => {
    const { items, problems } = catalogOf([], { "orphan.json": { title: "Lost" } });

    expect(items).toEqual([]);
    expect(problems).toEqual([expect.stringContaining("orphan.json")]);
  });

  it("reads a collection's title, description and cover from its folder", () => {
    const files = ["brasa/teaser.mp4", "brasa/cover.png"];
    const json = { "brasa/collection.json": { title: "BRASA", description: "Conferences" } };

    const collection = only<VideoCollection>(catalogOf(files, json).items);

    expect(collection).toMatchObject({
      title: { en: "BRASA" },
      description: { pt: "Conferences" },
      cover: url("brasa/cover.png"),
    });
  });

  it("hides a collection that has no videos yet", () => {
    const { items } = catalogOf([], { "brasa/collection.json": { title: "BRASA" } });

    expect(items).toEqual([]);
  });

  it("puts links after the videos, in the order they are written", () => {
    const json = {
      "links.json": [
        { title: "YouTube", url: "https://youtube.com/@me", thumbnail: "yt.jpg" },
        { title: "Vimeo", url: "https://vimeo.com/me" },
      ],
    };

    const { items } = catalogOf(["reel.mp4", "yt.jpg"], json);

    expect(items.map((item) => item.kind)).toEqual(["video", "link", "link"]);
    expect(items[1]).toMatchObject({ url: "https://youtube.com/@me", thumbnail: url("yt.jpg") });
  });

  it.each([
    ["no url", { title: "YouTube" }],
    ["a url that isn't a web address", { title: "YouTube", url: "youtube" }],
    ["no title", { url: "https://youtube.com" }],
  ])("reports a link with %s", (_, entry) => {
    const { items, problems } = catalogOf([], { "links.json": [entry] });

    expect(items).toEqual([]);
    expect(problems).toEqual([expect.stringContaining("entry 1")]);
  });
});
