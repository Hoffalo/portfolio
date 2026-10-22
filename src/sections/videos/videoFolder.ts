import { VideoCatalogBuilder } from "./catalog/VideoCatalogBuilder";

/*
 * Adapter between Vite and the catalog: Vite lists the files in /videos at build time (and again
 * whenever one is added during `npm run dev`), keyed by their path from the project root. The
 * catalog only understands paths relative to the videos folder, so the prefix is stripped here.
 * Globs must be literal strings for Vite to read them, which is why each is written out in full.
 */

const ROOT = "/videos/";

const mediaFiles = import.meta.glob<string>("/videos/**/*.{mp4,webm,mov,m4v,MP4,MOV}", {
  eager: true,
  query: "?url",
  import: "default",
});

const imageFiles = import.meta.glob<string>(
  "/videos/**/*.{jpg,jpeg,png,webp,gif,avif,JPG,JPEG,PNG}",
  { eager: true, query: "?url", import: "default" },
);

const jsonFiles = import.meta.glob<unknown>("/videos/**/*.json", {
  eager: true,
  import: "default",
});

const relative = (path: string) => path.slice(ROOT.length);

const builder = new VideoCatalogBuilder();
for (const [path, url] of Object.entries({ ...mediaFiles, ...imageFiles }))
  builder.addFile(relative(path), url);
for (const [path, data] of Object.entries(jsonFiles)) builder.addJson(relative(path), data);

/** Built once per page load: the folder can't change while the site is running. */
export const videoCatalog = builder.build();

if (import.meta.env.DEV)
  for (const problem of videoCatalog.problems) console.warn(`[videos] ${problem}`);
