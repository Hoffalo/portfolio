# Videos

Everything in this folder appears in the Filmmaking section: on the gallery wall in play mode and as a grid in boring mode. Nothing needs registering in code. Save a file here, and it shows up (while `npm run dev` is running, the page updates by itself).

```
videos/
├── links.json                 tiles that open another site (your YouTube channel…)
├── 01-showreel.mp4            a video on its own
├── 01-showreel.jpg            its thumbnail (optional)
├── 01-showreel.json           its title and description (optional)
└── brasa/                     every folder is a collection
    ├── collection.json        the collection's title and description (optional)
    ├── cover.jpg              the collection's thumbnail (optional)
    ├── 01-conference-teaser.mp4
    └── 02-ensina-promo.mp4
```

## Rules

- **Order** follows file and folder names. Start them with numbers (`01-`, `02-`) to choose it. The numbers never show.
- **Titles** come from file names: `02-ensina_promo.mp4` is titled "Ensina promo". A JSON file with the same name overrides it.
- **Thumbnails**: an image with the video's name (`.jpg`, `.png`, `.webp`). Without one, a frame from one second in is used.
- **Collections**: each folder directly inside `videos/` is one. Its thumbnail is `cover.jpg`, or else its first video's. A folder with no videos stays hidden, so you can set one up before you film it.
- **Formats**: MP4 (H.264 + AAC) plays everywhere. WebM works too. Avoid `.mov` from a camera, because only some browsers play it.

## The JSON files

Any text can be one string for both languages, or `{ "en": "…", "pt": "…" }`. Every field is optional.

`<video name>.json`

```json
{
  "title": { "en": "Conference teaser", "pt": "Teaser da conferência" },
  "description": "Shot and edited in three days.",
  "orientation": "portrait"
}
```

`orientation` is `"landscape"` (the default) or `"portrait"` for Reels, Shorts and vertical screens.

**A video hosted on YouTube, Vimeo or Drive** needs only the JSON file, with a `source` and no video file:

```json
{ "title": "Botzo devlog", "source": { "provider": "youtube", "id": "dQw4w9WgXcQ" } }
```

The `id` is the part of the link after `watch?v=` (YouTube), after `vimeo.com/` (Vimeo), or between `/d/` and `/view` (Drive, shared as "Anyone with the link").

`collection.json`

```json
{ "title": "BRASA", "description": "Conferences and campaigns." }
```

`links.json` is a list, shown after the videos, in the order written:

```json
[
  {
    "title": "My YouTube channel",
    "url": "https://www.youtube.com/@handle",
    "thumbnail": "youtube.jpg"
  }
]
```

`thumbnail` is an image in this folder, or a full URL.

## Size

These files are copied into the website, and GitHub rejects files over 100 MB. Export web versions (1080p, around 8–12 Mbit/s keeps a 2-minute video under 100 MB). For long pieces, put them on YouTube (unlisted works) and use a `source` instead.

Mistakes (a JSON file with no video next to it, a link without a URL) are listed as `[videos]` warnings in the browser console during `npm run dev`.
