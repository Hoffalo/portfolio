import { loadedImage } from "./images";
import type { Ctx } from "./pixel";

/** Where a sprite sits on its sheet: [x, y, width, height, anchorX, anchorY]. */
export type SpriteFrame = readonly [number, number, number, number, number, number];
export type Frames = Readonly<Record<string, SpriteFrame>>;

/**
 * A sprite sheet exported from Aseprite (sources live in /art) plus the frame table generated with it.
 * The anchor lets art overhang its logical footprint, e.g. a tree crown wider than its trunk.
 */
export interface SpriteSheet {
  url: string;
  frames: Frames;
}

/**
 * Draws a frame with its anchor at (x, y). Returns false while the sheet is still loading, so callers
 * can skip dependent details. Mirrored frames flip around the footprint, keeping the anchor in place.
 */
export function drawSprite(
  ctx: Ctx,
  sheet: SpriteSheet,
  id: string,
  x: number,
  y: number,
  flip = false,
): boolean {
  const frame = sheet.frames[id];
  const image = loadedImage(sheet.url);
  if (!frame || !image) return false;
  const [sx, sy, width, height, ox, oy] = frame;
  const top = Math.round(y - oy);
  if (!flip) {
    ctx.drawImage(image, sx, sy, width, height, Math.round(x - ox), top, width, height);
    return true;
  }
  ctx.save();
  ctx.translate(Math.round(x + ox), top);
  ctx.scale(-1, 1);
  ctx.drawImage(image, sx, sy, width, height, 0, 0, width, height);
  ctx.restore();
  return true;
}

const patterns = new Map<string, CanvasPattern>();

/**
 * A frame as a repeating fill, for seamless textures such as grass or floorboards. Patterns follow
 * the context's transform, so tiles stay locked to world coordinates as the camera moves.
 */
export function tilePattern(ctx: Ctx, sheet: SpriteSheet, id: string): CanvasPattern | undefined {
  const key = `${sheet.url}#${id}`;
  const cached = patterns.get(key);
  if (cached) return cached;
  const frame = sheet.frames[id];
  const image = loadedImage(sheet.url);
  if (!frame || !image || typeof document === "undefined") return undefined;
  const [sx, sy, width, height] = frame;
  const tile = document.createElement("canvas");
  tile.width = width;
  tile.height = height;
  tile.getContext("2d")?.drawImage(image, sx, sy, width, height, 0, 0, width, height);
  const pattern = ctx.createPattern(tile, "repeat") ?? undefined;
  if (pattern) patterns.set(key, pattern);
  return pattern;
}

/** Size of a frame, for laying out tiles. */
export const frameSize = (sheet: SpriteSheet, id: string) => {
  const frame = sheet.frames[id];
  return frame ? { width: frame[2], height: frame[3] } : { width: 0, height: 0 };
};
