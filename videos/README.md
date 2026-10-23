# Videos

Everything in this folder appears in the Filmmaking section: on the gallery wall in play mode and as a grid in boring mode. The videos themselves live on **YouTube** (Unlisted works), **Vimeo** or **Google Drive**. This folder only holds a JSON file per tile, plus optional thumbnail images. Nothing needs registering in code. Save a file here and it shows up (while `npm run dev` is running, the page updates by itself).

```
videos/
├── 01-showreel.json      a video on its own
├── 02-brasa.json         a collection: a file with a "videos" list
├── links.json            tiles that open another site (your YouTube channel…)
└── thumbnails/           optional images, named in the JSON files
```

## Rules

- **Order** follows file names. Start them with numbers (`01-`, `02-`) to choose it. The numbers never show. Inside a collection, videos keep the order they're written in. `links.json` comes last.
- **Links** are pasted straight from the browser or a Share button: `youtube.com/watch?v=…`, `youtu.be/…`, `youtube.com/shorts/…`, `vimeo.com/…`, `drive.google.com/file/d/…/view`. Drive files must be shared as "Anyone with the link".
- **Thumbnails** come from YouTube, Vimeo or Drive automatically. To use your own, put an image in this folder and name it in `"thumbnail"` (its path inside `videos/`, e.g. `"thumbnails/teaser.jpg"`), or give a full URL. A collection without one uses its first video's.
- **Text** can be one string for both languages, or `{ "en": "…", "pt": "…" }`.
- **Orientation**: YouTube Shorts show upright on their own. For any other vertical video, add `"orientation": "portrait"`.

## A video on its own

`01-showreel.json`. Only `url` is required; the title defaults to the file name ("Showreel").

```json
{
  "title": { "en": "Showreel 2026", "pt": "Showreel 2026" },
  "description": "Highlights from this year.",
  "url": "https://youtu.be/dQw4w9WgXcQ"
}
```

## A collection

`02-brasa.json`. Each video needs a `title` and a `url`. A collection with an empty list stays hidden, so you can set one up before its videos are published.

```json
{
  "title": "BRASA",
  "description": { "en": "Conferences and campaigns.", "pt": "Conferências e campanhas." },
  "thumbnail": "thumbnails/brasa.jpg",
  "videos": [
    {
      "title": { "en": "Conference teaser", "pt": "Teaser da conferência" },
      "description": "Shot and edited in three days.",
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    { "title": "Ensina promo", "url": "https://youtube.com/shorts/dQw4w9WgXcQ" }
  ]
}
```

## Links

`links.json` is a list. Each entry needs a `title` and a full `url`:

```json
[
  {
    "title": "My YouTube channel",
    "url": "https://www.youtube.com/@handle",
    "thumbnail": "thumbnails/youtube.jpg"
  }
]
```

## Mistakes

A bad link, a missing title or a thumbnail that isn't in the folder skips only that entry. During `npm run dev` each one is listed as a `[videos]` warning in the browser console.
