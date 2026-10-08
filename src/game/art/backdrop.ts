import { rect, type Ctx } from "./pixel";
import { drawSprite, frameSize, type SpriteSheet } from "./sprites";
import type { Frame } from "./types";

/**
 * A vertical sky gradient across the whole view (wider than the world on big screens), with an
 * ordered-dither seam between each band so it reads as pixel art rather than as stripes.
 */
export function paintSkyGradient({ ctx, view }: Frame, bands: readonly string[], horizon: number) {
  const top = Math.min(view.y, 0);
  const band = Math.ceil((horizon - top) / bands.length);
  const left = view.x - 1;
  const width = view.width + 2;
  bands.forEach((color, index) => {
    const y = top + index * band;
    rect(ctx, color, left, y, width, band);
    const next = bands[index + 1];
    if (!next) return;
    // Two rows of checkerboard blending into the next band.
    ditherRow(ctx, next, left, y + band - 2, width, 0);
    ditherRow(ctx, next, left, y + band - 1, width, 1);
  });
}

function ditherRow(ctx: Ctx, color: string, x: number, y: number, width: number, phase: number) {
  ctx.fillStyle = color;
  for (let column = (x + y + phase) % 2; column < width; column += 2)
    ctx.fillRect(Math.round(x + column), Math.round(y), 1, 1);
}

/**
 * A horizontally tiling backdrop layer resting on the horizon. Distant layers scroll with only part
 * of the camera's motion (parallax), which sells the depth of the skyline.
 */
export function paintBackdropLayer(
  { ctx, view }: Frame,
  sheet: SpriteSheet,
  id: string,
  baseY: number,
  parallax: number,
) {
  const { width } = frameSize(sheet, id);
  if (!width) return;
  const origin = Math.round(view.x * (1 - parallax));
  const first = origin + Math.floor((view.x - origin) / width) * width;
  for (let x = first; x < view.x + view.width; x += width) drawSprite(ctx, sheet, id, x, baseY);
}
