# Lorenzo Hoffmann — Playable Portfolio

A pixel-art portfolio you can walk around. Dark mode is a rainy **cyberpunk city**; light mode is a **fantasy kingdom**. Each section is a building around the central fountain. Walk through its door to enter a Pokémon-style room where every piece of furniture holds part of the portfolio. Prefer reading? **Boring mode** shows the same content as a classic sidebar layout. Everything is available in **English and Portuguese**.

Inspired by [Issam Arida's portfolio](https://github.com/issamarida/portfolio).

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit + component tests
npm run lint
npm run typecheck
npm run build      # static site in dist/
```

Pushes to `main` deploy through Vercel (the framework preset detects Vite automatically). CI runs typecheck, lint, tests and a build on every push and pull request.

## Where things live

| Folder                    | Responsibility                                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `src/content/`            | **Your data.** Profile, career, skills, videos, repo descriptions. Plain TypeScript objects with `{ en, pt }` text.                      |
| `src/sections/`           | One folder per portfolio section. Each exports a `SectionDefinition`: its building, its boring-mode page, and its room's furniture.      |
| `src/game/engine/`        | Framework-free game logic: input, movement and collision, camera, the frame loop.                                                        |
| `src/game/world/`         | Builds the town and room layouts (positions, collisions, doors) from the registered sections.                                            |
| `src/game/art/`           | Pixel-art painters. `cyberpunk/` and `fantasy/` each implement the same `ThemeArt` interface, drawing sprites and animating the details. |
| `art/`                    | **Aseprite sources** for every sprite sheet, one folder per theme. Their exported PNGs live in `src/game/art/<theme>/sprites/`.          |
| `src/features/game/`      | React glue for the game: canvas, HTML overlay, controls, dialog box.                                                                     |
| `src/features/boring/`    | The sidebar reading layout.                                                                                                              |
| `src/i18n/`, `src/theme/` | Language and theme state, both remembered between visits.                                                                                |
| `src/services/`           | GitHub API access and video-provider URLs.                                                                                               |

## Common changes

**A new job.** Add an entry at the top of `experiences` in `src/content/career.ts`. A new desk appears in the career room and a new card in boring mode. Give it an `accent` (the organisation's colour, used for its pennant or monitor) and a `motif` (the prop beside its desk: `camera`, `chart`, `robot`, `clapper`, `palette`, `podium`, `punching-bag`). Desks run oldest to newest, and roles at the same organisation share one desk, so a promotion just means adding the new role with the same `organization`.

**A new video.** Add an entry to `src/content/videos.ts`:

```ts
{
  id: "brasa-2027-teaser",
  title: { en: "BRASA 2027 Teaser", pt: "Teaser BRASA 2027" },
  client: "BRASA",
  role: { en: "Director & editor", pt: "Direção e edição" },
  year: 2027,
  orientation: "landscape", // "portrait" for Shorts, Reels and vertical OOH
  source: { provider: "youtube", id: "dQw4w9WgXcQ" },
}
```

The thumbnail is fetched automatically and hangs on the Filmmaking gallery wall as a painting (or an LED frame in the city).

**Better repo descriptions or ordering.** Edit `src/content/dev.ts` (`featuredRepos`, `hiddenRepos`, `repoDescriptions`). The repo list itself comes live from the GitHub API. Each repo is drawn as an object that matches its subject, guessed from its name and description ("music" becomes a jukebox, "game" an arcade cabinet). If the guess is wrong, set it in `repoMotifs`.

**Changing the art.** Open the sheet in `art/<theme>/` with Aseprite, edit it, and export it over the PNG of the same name in `src/game/art/<theme>/sprites/` (File → Export As, 1×). Keep each sprite where it is on the sheet: `<sheet>.ts` next to the PNG records every sprite's position. Moving parts (flames, water, screens, blinking lights) are drawn in code on top of the sprites.

**A whole new section** (e.g. Photography):

1. Create `src/sections/photography/index.tsx` exporting a `SectionDefinition`. Copy one of the existing sections as a template.
2. Pick a `building` and a `furniture` kind for each exhibit, from the lists in `src/sections/types.ts`.
3. Add it to the array in `src/sections/registry.ts`.

The town gains a building (the avenue grows north two buildings per row), the room is generated, and boring mode gets a new sidebar entry. If you want a brand-new building or furniture look, add the kind to `src/sections/types.ts`. TypeScript will then point at every place that needs a painter for it: both themes and the size catalog.

**Scenery and creatures.** The town layout (`src/game/world/townLayout.ts`) places props and creature roles. Each theme decides what they look like: a `barn` is a red barn or a neon garage, a `vehicle` is a royal carriage or a hover car, a `companion` is a fox or Botzo the robot dog. To add a new kind, add it to `PropKind` or `ActorRole` in `src/game/world/world.ts`, and TypeScript will point at the painters each theme needs.

## Hosting your videos

Use **YouTube** (Unlisted works fine) or **Vimeo** rather than Google Drive:

- **Thumbnails for free.** YouTube serves a thumbnail for every video ID, so a painting needs only the ID. Drive thumbnails only work for files shared publicly, and they're slow and unreliable.
- **Real streaming.** Adaptive quality, fast start and mobile support. Drive previews are low quality, buffer a lot, and show "too many views" errors on popular files.
- **Embeds that behave.** The player uses `youtube-nocookie.com` so visitors aren't tracked until they press play.

Drive is still supported (`{ provider: "drive", id }`) for client work you can't post publicly. Make sure the file is shared as "Anyone with the link". For short loops or private OOH pieces, export a compressed MP4 into `public/videos/` and use `{ provider: "file", src: "/videos/name.mp4", poster: "/thumbnails/name.jpg" }`. Keep those files small, because they ship with the site.
