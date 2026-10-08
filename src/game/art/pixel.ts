/**
 * Drawing primitives that stay on the pixel grid. Everything is built from filled rectangles,
 * never anti-aliased paths, so the upscaled canvas keeps hard pixel edges.
 */
export type Ctx = CanvasRenderingContext2D;
/** A flat colour or a repeating texture (see `tilePattern`). */
export type Paint = string | CanvasPattern;

export function rect(ctx: Ctx, color: Paint, x: number, y: number, width: number, height: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

/** A filled ellipse made of one rectangle per row. */
export function disc(ctx: Ctx, color: Paint, cx: number, cy: number, rx: number, ry: number) {
  ctx.fillStyle = color;
  for (let row = -ry; row < ry; row++) {
    const half = Math.round(rx * Math.sqrt(1 - ((row + 0.5) / ry) ** 2));
    ctx.fillRect(Math.round(cx - half), Math.round(cy + row), half * 2, 1);
  }
}

/** A pointed roof or cone: rows that widen from `top` down to `bottom`. */
export function gable(
  ctx: Ctx,
  color: string,
  cx: number,
  top: number,
  bottom: number,
  halfWidth: number,
) {
  ctx.fillStyle = color;
  for (let y = top; y < bottom; y++) {
    const half = Math.round(((y - top + 1) / (bottom - top)) * halfWidth);
    ctx.fillRect(Math.round(cx - half), y, half * 2, 1);
  }
}

/** Soft light as stepped, translucent ellipses — the pixel-art way to fake a glow. */
export function glow(
  ctx: Ctx,
  color: string,
  cx: number,
  cy: number,
  radius: number,
  strength = 0.12,
) {
  ctx.save();
  ctx.globalAlpha = strength;
  for (let step = 3; step >= 1; step--)
    disc(ctx, color, cx, cy, (radius * step) / 3, (radius * step) / 4);
  ctx.restore();
}

/** Deterministic pseudo-random number in [0, 1) so procedural scenery is identical on every frame. */
export function hash(index: number, seed = 0): number {
  let value = Math.imul(index ^ 0x5bd1e995, 0x27d4eb2d) ^ Math.imul(seed + 0x9e3779b9, 0x85ebca6b);
  value = Math.imul(value ^ (value >>> 15), 0x2c1b3c6d);
  value ^= value >>> 12;
  return (value >>> 0) / 4294967296;
}

/** Square wave between 0 and 1, used for blinking lights. */
export const blink = (time: number, period: number, offset = 0) =>
  Math.floor((time + offset) / period) % 2;

/** Calls `paint` for every tile of a grid that intersects the visible area. */
export function forEachTile(
  view: { x: number; y: number; width: number; height: number },
  size: number,
  paint: (x: number, y: number, column: number, row: number) => void,
) {
  const firstColumn = Math.floor(view.x / size);
  const firstRow = Math.floor(view.y / size);
  for (let row = firstRow; row * size < view.y + view.height; row++) {
    for (let column = firstColumn; column * size < view.x + view.width; column++) {
      paint(column * size, row * size, column, row);
    }
  }
}

/** Stamps a square brush along a line: chunky, jagged-on-purpose pixel strokes for paths. */
export function stroke(
  ctx: Ctx,
  color: Paint,
  from: { x: number; y: number },
  to: { x: number; y: number },
  width: number,
) {
  ctx.fillStyle = color;
  const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y)));
  for (let step = 0; step <= steps; step++) {
    const x = from.x + ((to.x - from.x) * step) / steps;
    const y = from.y + ((to.y - from.y) * step) / steps;
    ctx.fillRect(
      Math.round(x - width / 2),
      Math.round(y - width / 2),
      Math.round(width),
      Math.round(width),
    );
  }
}

/** One pixel of vertical sway, for trees, flags and grass in the breeze. */
export const sway = (time: number, seed: number, speed = 1.3) =>
  Math.round(Math.sin(time * speed + seed * 1.7) * 0.6);
