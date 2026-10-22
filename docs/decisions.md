# Design decisions

Short records of why the code is shaped the way it is. Each pattern named here is also named in the docstring of the code that uses it.

## Videos come from a folder, not a content file

**Context.** Videos are added often, by someone editing video rather than code. A TypeScript content file meant writing an entry per video and copying files to `public/` by hand.

**Decision.** `videos/` is read at build time with Vite's `import.meta.glob`. Top-level folders become collections, file names become titles and order, and optional JSON files next to a video add a description or point to a hosted copy. `links.json` holds tiles that leave the site.

**Consequences.** Adding a video needs no code. The files ship with the site, so large ones must be compressed or hosted on YouTube (`videos/README.md` explains both). Mistakes in the JSON are reported as console warnings in development instead of breaking the page.

## Patterns in the video section

- **Adapter** (`services/videoSources.ts`, `sections/videos/videoFolder.ts`). YouTube, Vimeo, Drive and plain files each have their own URL schemes; one interface hides them. Vite's glob results are adapted into the folder-relative paths the catalog understands, so the catalog has no dependency on Vite and is tested with plain lists of paths.
- **Builder** (`VideoCatalogBuilder`). A video is up to three files (video, image, JSON) that arrive in any order. Parts are collected first and assembled in `build()`. The trade-off is a mutable object during building; it never escapes `videoFolder.ts`.
- **Factory Method** (`shelfExhibits.tsx`). Whether an item becomes a painting, a screen or a poster, and what opening it does, depends on its kind. A table per kind (`RulesByKind`) replaces `if` chains, and adding a kind fails to compile until every table handles it.
- **Proxy** (`thumbnails.ts`). Asking for a thumbnail is cheap and immediate. Behind it, a frame is captured from the video the first time, then cached. The trade-off is a placeholder until the capture lands.
- **Observer** (also `thumbnails.ts`). Tiles and paintings subscribe to the proxy through `useSyncExternalStore` and re-render when a frame arrives. The proxy doesn't know who is listening.
- **Singleton**. `videoCatalog` and the thumbnail proxy are module-level instances, created once. The folder can't change while the site runs, and the frame cache must be shared so a video is never downloaded twice. Tests build their own `VideoCatalogBuilder` instead of using the singleton.

## Popups are a stack owned by one provider

**Context.** A collection opens a grid; a video opened from the grid must replace it, and closing the video must bring the grid back exactly as it was left (same scroll position). The same popups are needed in rooms and in boring mode.

**Decision.** `PopupProvider` holds a stack of popups, changed by a pure reducer (`applyPopupChange`). Only the top one shows; the ones beneath stay mounted but hidden. It is keyed by route in `App`, so leaving a page closes everything. Rooms no longer own dialog state; they ask for a popup, and pause the game while one is open.

**Considered and rejected.** The **Command** pattern, with undoable open/close objects. Nothing needs undo, history or auditing, so a two-case reducer does the job with less code.

## Fixture actions dispatch through a handler map

`runFixtureAction` takes a map from action type to handler. The town and rooms each list only the actions they handle, so a new action type means a new map entry, not another `if`.

## Shared hooks and helpers

`useLatest` (the latest callback for long-lived listeners and the game loop) and `isTypingTarget` (keys typed into a form field never reach the game) were copied in three and two places. Each now has one definition.

## The room layout is split into steps

`buildRoomWorld` was one 190-line function. It now plans the room (`planRoom`, which returns a `RoomPlan` parameter object) and then runs one function per placement step (`hangOnWall`, `standOnFloor`, `standAtEntrance`, `furnish`, `walls`). Behaviour is unchanged; the existing room tests cover it.
