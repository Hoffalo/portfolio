/**
 * Target visible height in art pixels; the actual height varies with the screen. The town is seen
 * from further back so the skyline fits above the buildings; rooms stay close and cosy.
 */
const TARGET_VIEW_HEIGHT = { town: 270, room: 230 } as const;
/** Below this many art pixels across, the town becomes hard to read, so phones zoom out instead. */
const MIN_VIEW_WIDTH = 190;
/** How much closer than usual the camera may zoom to fill the screen with a small room. */
const MAX_EXTRA_ZOOM = 2;

export interface PixelViewport {
  /** Whole CSS pixels per art pixel; integers keep every pixel the same size. */
  scale: number;
  width: number;
  height: number;
}

export function computePixelViewport(
  cssWidth: number,
  cssHeight: number,
  world: { kind: keyof typeof TARGET_VIEW_HEIGHT; width: number; height: number },
): PixelViewport {
  const base = Math.max(
    1,
    Math.round(Math.min(cssHeight / TARGET_VIEW_HEIGHT[world.kind], cssWidth / MIN_VIEW_WIDTH)),
  );
  const fit = Math.floor(Math.min(cssWidth / world.width, cssHeight / world.height));
  const scale = Math.min(base + MAX_EXTRA_ZOOM, Math.max(base, fit));
  return { scale, width: Math.ceil(cssWidth / scale), height: Math.ceil(cssHeight / scale) };
}
