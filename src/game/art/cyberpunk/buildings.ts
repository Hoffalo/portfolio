import type { Rect } from "../../engine/geometry";
import type { BuildingKind } from "../../../sections/types";
import { blink, hash, rect } from "../pixel";
import { drawSprite } from "../sprites";
import type { Frame } from "../types";
import { NEON } from "./palette";
import { CITY_SHEET } from "./sheets";

type BuildingPainter = (frame: Frame, bounds: Rect) => void;

/**
 * Each building is one sprite from the town sheet; the code animates the screens, signs and lights.
 * Offsets below match the art in art/cyberpunk/town.aseprite.
 */
export const cyberBuildings: Record<BuildingKind, BuildingPainter> = {
  residence: (frame, b) => {
    const { ctx, time } = frame;
    paintBody(frame, "residence", b);
    if (blink(time, 0.7)) rect(ctx, NEON.red, b.x + 57, b.y - 7, 3, 2);
    // Someone switches their light off and on again.
    const pod = Math.floor(time / 3) % 14;
    if (blink(time, 1.5, pod))
      rect(ctx, "#140f26", b.x + 6 + (pod % 5) * 12, b.y + 17 + Math.floor(pod / 5) * 10, 7, 5);
    if (Math.sin(time * 9) > -0.85) rect(ctx, NEON.pink, b.x + 61, b.y + 25, 5, 1);
  },
  corporate: (frame, b) => {
    const { ctx, time } = frame;
    paintBody(frame, "corporate", b);
    if (blink(time, 1.1)) rect(ctx, NEON.red, b.x + 3, b.y + 2, 2, 2);
    if (blink(time, 1.1, 0.5)) rect(ctx, NEON.red, b.x + 70, b.y + 2, 2, 2);
    // A scanline rolls through the holographic logo.
    const scan = Math.floor((time * 10) % 20);
    if (scan < 16) rect(ctx, "#c8ffff", b.x + 31, b.y + 26 + scan, 13, 1);
  },
  datacenter: (frame, b) => {
    const { ctx, time } = frame;
    paintBody(frame, "datacenter", b);
    for (let fan = 0; fan < 3; fan++) {
      const cx = b.x + 12 + fan * 18;
      const spin = Math.floor(time * 12 + fan) % 2;
      rect(ctx, "#4a4868", cx - (spin ? 4 : 0), b.y + (spin ? 10 : 7), spin ? 9 : 1, spin ? 1 : 7);
    }
    // Racks of status lights behind the server window.
    for (let column = 0; column < 23; column++) {
      for (let row = 0; row < 4; row++) {
        const on = hash(column + row * 23, Math.floor(time * 3 + column * 0.3)) > 0.45;
        const color = column % 6 === 0 ? NEON.yellow : row === 3 ? NEON.cyan : NEON.green;
        rect(ctx, on ? color : NEON.greenDim, b.x + 6 + column * 3, b.y + 34 + row * 3, 1, 1);
      }
    }
  },
  theater: (frame, b) => {
    paintBody(frame, "theater", b);
    paintScreen(frame, b);
    paintMarquee(frame, b);
    paintPosters(frame, b);
  },
};

function paintBody({ ctx }: Frame, kind: BuildingKind, b: Rect) {
  ctx.save();
  ctx.globalAlpha = 0.45;
  rect(ctx, "#000", b.x + 3, b.y + b.height - 1, b.width, 3);
  ctx.restore();
  drawSprite(ctx, CITY_SHEET, kind, b.x, b.y);
}

/** The rooftop screen plays a looping "trailer": a skyline at dusk and a figure running past. */
function paintScreen({ ctx, time }: Frame, b: Rect) {
  const x = b.x + 10;
  const y = b.y + 3;
  const scene = Math.floor(time / 5) % 3;
  const skies = [
    ["#ff3cac", "#a8206e", "#3a1052"],
    ["#2de2e6", "#1d6b7a", "#0b1d26"],
    ["#f9c80e", "#c4581e", "#3a1438"],
  ][scene]!;
  skies.forEach((color, band) => rect(ctx, color, x, y + band * 6, 62, 6));
  for (let tower = 0; tower < 10; tower++) {
    const height = 4 + Math.floor(hash(tower, scene) * 9);
    rect(ctx, "#05030c", x + tower * 6 + 1, y + 18 - height, 5, height);
  }
  const runner = x + ((time * 22) % 70) - 4;
  rect(ctx, "#05030c", runner, y + 9, 2, 5);
  rect(ctx, "#05030c", runner - 1 + (Math.floor(time * 10) % 2), y + 14, 1, 2);
  rect(ctx, "#05030c", runner + 2 - (Math.floor(time * 10) % 2), y + 14, 1, 2);
  // Scanlines.
  ctx.save();
  ctx.globalAlpha = 0.2;
  for (let line = 0; line < 18; line += 2) rect(ctx, "#000", x, y + line, 62, 1);
  ctx.restore();
}

function paintMarquee({ ctx, time }: Frame, b: Rect) {
  const x = b.x + 4;
  const y = b.y + 30;
  for (let bulb = 0; bulb * 4 < 72; bulb++) {
    const lit = (bulb + Math.floor(time * 6)) % 3 === 0;
    rect(ctx, lit ? NEON.yellow : "#5a4410", x + 1 + bulb * 4, y, 2, 1);
    rect(ctx, lit ? NEON.yellow : "#5a4410", x + 1 + bulb * 4, y + 5, 2, 1);
  }
  // NOW SHOWING, as a row of tiny glyph blocks.
  for (let glyph = 0; glyph < 11; glyph++) {
    if (glyph === 3) continue;
    rect(ctx, NEON.pink, x + 17 + glyph * 4, y + 2, 3, 2);
  }
}

const POSTERS = [NEON.pink, NEON.cyan, NEON.violet, NEON.yellow];

function paintPosters({ ctx, time }: Frame, b: Rect) {
  const cycle = Math.floor(time / 4);
  [9, 61].forEach((px, index) => {
    const color = POSTERS[(cycle + index * 2) % POSTERS.length]!;
    const x = b.x + px;
    const y = b.y + 40;
    rect(ctx, "#0d0a1c", x, y, 12, 16);
    rect(ctx, color, x + 1, y + 1, 10, 9);
    rect(ctx, "#05030c", x + 4, y + 3, 4, 7);
    rect(ctx, "#05030c", x + 5, y + 2, 2, 2);
    rect(ctx, color, x + 2, y + 12, 8, 1);
    rect(ctx, color, x + 3, y + 14, 6, 1);
  });
}
