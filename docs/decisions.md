# Design decisions

Short records of why the code is shaped the way it is. Each pattern named here is also named in the docstring of the code that uses it.

## Videos are links, listed in a folder of JSON files

**Context.** Videos are added often, by someone editing video rather than code. The first version bundled video files from `videos/`, but GitHub rejects files over 100 MB and every visitor would download from the site's own hosting.

**Decision.** Videos live on YouTube, Vimeo or Drive. `videos/` holds one JSON file per shelf tile, read at build time with Vite's `import.meta.glob`: a file with a `"videos"` list is a collection, any other is a single video, and `links.json` holds tiles that leave the site. Links are pasted as copied from the browser and parsed into a provider and ID. Optional thumbnail images can sit in the folder.

**Consequences.** Adding a video needs no code and nothing large in git. Thumbnails come from the provider. Mistakes in the JSON are reported as console warnings in development, and cost only the entry that has them.

**Replaced.** Local video files and the thumbnail **Proxy** (with an **Observer**) that captured a frame from them. With every video hosted, the provider always has a thumbnail, so both became dead code and were removed.

## Patterns in the video section

- **Adapter** (`services/videoSources.ts`, `sections/videos/videoFolder.ts`). YouTube, Vimeo and Drive each have their own link formats and URLs; one interface reads their links and builds their thumbnail, player and page URLs. Vite's glob results are adapted into the folder-relative paths the catalog understands, so the catalog has no dependency on Vite and is tested with plain objects.
- **Builder** (`VideoCatalogBuilder`). JSON files name thumbnail images that may be added before or after them, so files are collected first and assembled in `build()`. The trade-off is a mutable object during building; it never escapes `videoFolder.ts`.
- **Factory Method** (`shelfExhibits.tsx`). Whether an item becomes a painting, a screen or a poster, and what opening it does, depends on its kind. A table per kind (`RulesByKind`) replaces `if` chains, and adding a kind fails to compile until every table handles it.
- **Singleton**. `videoCatalog` is a module-level instance, built once: the folder can't change while the site runs. Tests build their own `VideoCatalogBuilder` instead.

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
