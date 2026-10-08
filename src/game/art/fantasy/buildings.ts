import type { Rect } from "../../engine/geometry";
import type { BuildingKind } from "../../../sections/types";
import { disc, glow, rect } from "../pixel";
import { drawSprite } from "../sprites";
import type { Frame } from "../types";
import type { KingdomSheets } from "./sheets";

type BuildingPainter = (frame: Frame, bounds: Rect) => void;

/**
 * Each building is one sprite from the town sheet; the code only adds what moves: chimney smoke,
 * flickering torches, the wizard's pulsing window and the gallery's rotating posters.
 */
/** Building painters drawing from the given sheets. */
export const buildingsFrom = (sheets: KingdomSheets): Record<BuildingKind, BuildingPainter> => ({
  residence: (frame, b) => {
    paintBody(frame, sheets, "residence", b);
    chimneySmoke(frame, b.x + 53, b.y + 1);
  },
  corporate: (frame, b) => {
    paintBody(frame, sheets, "corporate", b);
    for (const x of [26, 47]) torch(frame, b.x + x, b.y + 66, x);
  },
  datacenter: (frame, b) => {
    paintBody(frame, sheets, "datacenter", b);
    const pulse = 0.5 + 0.5 * Math.sin(frame.time * 2);
    glow(frame.ctx, "#c9a8ff", b.x + 39, b.y + 34, 10, 0.1 + pulse * 0.12);
    if (pulse > 0.6) rect(frame.ctx, "#f2e8ff", b.x + 37, b.y + 31, 2, 2);
    // Runes orbit the roof tip.
    for (let rune = 0; rune < 3; rune++) {
      const angle = frame.time * 1.2 + (rune * Math.PI * 2) / 3;
      if (Math.sin(angle) > -0.3)
        rect(
          frame.ctx,
          "#9fe8ff",
          b.x + 39 + Math.cos(angle) * 18,
          b.y + 8 + Math.sin(angle) * 4,
          1,
          1,
        );
    }
  },
  theater: (frame, b) => {
    paintBody(frame, sheets, "theater", b);
    paintPosters(frame, b);
  },
});

function paintBody({ ctx }: Frame, sheets: KingdomSheets, kind: BuildingKind, b: Rect) {
  ctx.save();
  ctx.globalAlpha = 0.28;
  disc(ctx, "#1d1a10", b.x + b.width / 2 + 3, b.y + b.height - 1, b.width / 2 + 4, 4);
  ctx.restore();
  drawSprite(ctx, sheets.town, kind, b.x, b.y);
}

function chimneySmoke({ ctx, time }: Frame, x: number, y: number) {
  for (let puff = 0; puff < 4; puff++) {
    const age = (time * 0.45 + puff / 4) % 1;
    ctx.save();
    ctx.globalAlpha = 0.55 * (1 - age);
    const radius = 2 + age * 3;
    disc(ctx, "#f2efe9", x + Math.sin(age * 5 + puff) * 2 + age * 6, y - age * 18, radius, radius);
    ctx.restore();
  }
}

function torch({ ctx, time }: Frame, x: number, y: number, seed: number) {
  const flicker = Math.round(Math.sin(time * 13 + seed) * 0.8);
  rect(ctx, "#ff8c2a", x, y - 1 - flicker, 1, 2 + flicker);
  rect(ctx, "#fff2c2", x, y, 1, 1);
  glow(ctx, "#ffb347", x, y, 6, 0.1);
}

/** Film posters cycle in the gallery's two frames, like a box office changing its bill. */
const POSTER_SLOTS = [
  { x: 16, y: 38 },
  { x: 57, y: 38 },
];
const POSTERS = [
  { sky: "#2a3a6a", accent: "#f0cc78", figure: "#141024" },
  { sky: "#7a2a3a", accent: "#ffd8a8", figure: "#2a0f18" },
  { sky: "#2a5a4a", accent: "#e8f4c8", figure: "#0f241c" },
  { sky: "#4a2a6a", accent: "#ff9ad0", figure: "#1a0f28" },
];

function paintPosters({ ctx, time }: Frame, b: Rect) {
  const cycle = Math.floor(time / 4);
  POSTER_SLOTS.forEach((slot, index) => {
    const poster = POSTERS[(cycle + index * 2) % POSTERS.length]!;
    const x = b.x + slot.x;
    const y = b.y + slot.y;
    rect(ctx, poster.sky, x, y, 9, 13);
    rect(ctx, poster.accent, x + 5, y + 2, 2, 2);
    rect(ctx, poster.figure, x + 2, y + 6, 3, 5);
    rect(ctx, poster.figure, x + 3, y + 4, 2, 2);
    rect(ctx, poster.figure, x, y + 11, 9, 2);
    rect(ctx, poster.accent, x + 1, y + 11, 5, 1);
  });
}
