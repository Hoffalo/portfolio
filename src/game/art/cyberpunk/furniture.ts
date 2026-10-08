import type { Rect } from "../../engine/geometry";
import type { FurnitureKind, Motif } from "../../../sections/types";
import type { FurnitureDetails } from "../../world/world";
import { animateMotif, forEachDay, isNear, type Piece } from "../exhibits";
import { drawCover } from "../images";
import { blink, disc, glow, hash, rect, type Ctx } from "../pixel";
import { drawSprite } from "../sprites";
import type { Frame } from "../types";
import { CITY, NEON } from "./palette";
import { CITY_INTERIOR } from "./sheets";

type FurniturePainter = (frame: Frame, b: Rect, piece: Piece) => void;

const body = (ctx: Ctx, kind: FurnitureKind, b: Rect) => {
  ctx.save();
  ctx.globalAlpha = 0.4;
  rect(ctx, "#000", b.x + 2, b.y + b.height - 1, b.width, 2);
  ctx.restore();
  drawSprite(ctx, CITY_INTERIOR, kind, b.x, b.y);
};

function scanlines(ctx: Ctx, area: Rect, strength = 0.18) {
  ctx.save();
  ctx.globalAlpha = strength;
  for (let y = area.y; y < area.y + area.height; y += 2)
    rect(ctx, "#000", area.x, y, area.width, 1);
  ctx.restore();
}

/** An LED frame: the picture if there is one, otherwise a NO SIGNAL test card. Its spotlight wakes up nearby. */
const ledFrame =
  (kind: FurnitureKind, border: string): FurniturePainter =>
  ({ ctx, time }, b, { image, near }) => {
    const inner = { x: b.x + 2, y: b.y + 2, width: b.width - 4, height: b.height - 4 };
    if (image) drawCover(ctx, image, inner.x, inner.y, inner.width, inner.height);
    else noSignal(ctx, inner, time);
    scanlines(ctx, inner);
    drawSprite(ctx, CITY_INTERIOR, kind, b.x, b.y);
    rect(ctx, near ? border : CITY.steel, b.x, b.y - 2, b.width, 1);
    if (near) glow(ctx, border, b.x + b.width / 2, b.y + b.height / 2, b.width * 0.6, 0.1);
  };

const BARS = ["#c8c8c8", "#c8c800", "#00c8c8", "#00c800", "#c800c8", "#c80000", "#0000c8"];

function noSignal(ctx: Ctx, area: Rect, time: number) {
  const width = area.width / BARS.length;
  BARS.forEach((color, index) =>
    rect(ctx, color, area.x + index * width, area.y, Math.ceil(width), area.height),
  );
  // Static crawls over the bars.
  for (let speck = 0; speck < 24; speck++) {
    const x = area.x + hash(speck, Math.floor(time * 12)) * area.width;
    const y = area.y + hash(speck + 50, Math.floor(time * 12)) * area.height;
    rect(ctx, speck % 2 ? "#ffffff" : "#000000", x, y, 1, 1);
  }
  rect(ctx, "#05030c", area.x + 2, area.y + area.height / 2 - 2, area.width - 4, 5);
  for (let glyph = 0; glyph < Math.min(9, (area.width - 8) / 3); glyph++)
    if (glyph !== 2)
      rect(ctx, "#ffffff", area.x + 4 + glyph * 3, area.y + area.height / 2 - 1, 2, 3);
}

/** A project dressed as its subject (an arcade cabinet, a jukebox…), with a status light in its language colour. */
function paintMotif(
  ctx: Ctx,
  motif: Motif,
  b: Rect,
  time: number,
  near: boolean,
  accent: string = NEON.cyan,
) {
  ctx.save();
  ctx.globalAlpha = 0.4;
  rect(ctx, "#000", b.x - 2, b.y + b.height - 1, b.width + 4, 2);
  ctx.restore();
  drawSprite(ctx, CITY_INTERIOR, `motif-${motif}`, b.x, b.y);
  animateMotif(ctx, motif, b, time, near);
  rect(
    ctx,
    blink(time, 0.8, b.x) ? accent : CITY.steelDark,
    b.x + b.width + 2,
    b.y + b.height - 4,
    2,
    2,
  );
  if (near) glow(ctx, accent, b.x + b.width / 2, b.y + b.height / 2, 20, 0.08);
}

const painters: Record<FurnitureKind, FurniturePainter> = {
  "painting-wide": ledFrame("painting-wide", NEON.pink),
  "painting-tall": ledFrame("painting-tall", NEON.pink),
  portrait: ledFrame("portrait", NEON.violet),
  screen: ledFrame("screen", NEON.green),
  poster: ({ ctx, time }, b) => {
    body(ctx, "poster", b);
    if (blink(time, 0.8, b.x)) rect(ctx, NEON.pink, b.x + 3, b.y + 15, 18, 1);
  },
  desk: ({ ctx, time }, b, { accent, lit, near, motif }) => {
    body(ctx, "desk", b);
    if (motif) drawSprite(ctx, CITY_INTERIOR, `motif-${motif}-small`, b.x - 14, b.y + 4);
    const color = accent ?? NEON.cyan;
    const screen = { x: b.x + 8, y: b.y + 1, width: 16, height: 7 };
    if (lit || near) {
      // The current job is still running: code scrolls past in the company colour.
      for (let line = 0; line < 3; line++) {
        const width = 3 + Math.floor(hash(line + b.x, Math.floor(time * 2 + line)) * 11);
        rect(ctx, line === 1 ? NEON.pink : color, screen.x + 1, screen.y + 1 + line * 2, width, 1);
      }
      if (blink(time, 0.5)) rect(ctx, "#ffffff", screen.x + 13, screen.y + 5, 1, 1);
      glow(ctx, color, screen.x + 8, screen.y + 4, 12, 0.08);
    } else {
      // Asleep: a logo-coloured dot drifts across the screensaver.
      const t = time * 0.7 + b.x;
      rect(
        ctx,
        color,
        screen.x + 1 + Math.abs(((t * 9) % 26) - 13),
        screen.y + 1 + Math.abs(((t * 5) % 10) - 5),
        2,
        1,
      );
    }
    rect(ctx, color, b.x + 5, b.y + 13, 22, 1);
    rect(ctx, color, b.x + 14, b.y + 15, 4, 3);
  },
  rack: ({ ctx, time }, b, { accent, near, motif }) => {
    if (motif) return paintMotif(ctx, motif, b, time, near, accent);
    body(ctx, "rack", b);
    const color = accent ?? NEON.green;
    for (let slot = 0, y = b.y + 4; y < b.y + 29; slot++, y += 4) {
      const on = hash(slot, Math.floor(time * (near ? 10 : 4) + b.x)) > 0.4;
      rect(ctx, on ? color : CITY.steelDark, b.x + 13, y, 1, 1);
      rect(ctx, on ? NEON.green : NEON.greenDim, b.x + 15, y, 1, 1);
    }
    rect(ctx, color, b.x + 2, b.y + 1, b.width - 4, 1);
  },
  bookshelf: ({ ctx }, b) => body(ctx, "bookshelf", b),
  globe: ({ ctx, time }, b, { near }) => {
    body(ctx, "globe", b);
    // A wireframe hologram that spins up when someone approaches.
    const cx = b.x + 8;
    const cy = b.y + 8;
    ctx.save();
    ctx.globalAlpha = near ? 0.9 : 0.6;
    for (let meridian = 0; meridian < 4; meridian++) {
      const phase = Math.cos(time * (near ? 4 : 1.2) + (meridian * Math.PI) / 4);
      const half = Math.round(Math.abs(phase) * 6);
      for (let y = -6; y <= 6; y += 2) {
        const width = Math.round(Math.sqrt(1 - (y / 7) ** 2) * half);
        rect(ctx, NEON.cyan, cx + (phase > 0 ? width : -width), cy + y, 1, 1);
      }
    }
    for (const y of [-3, 0, 3]) rect(ctx, NEON.cyanDim, cx - 6, cy + y, 13, 1);
    ctx.restore();
    disc(ctx, NEON.cyan, cx, cy + 10, 1, 1);
  },
  piano: ({ ctx, time }, b, { near }) => {
    body(ctx, "piano", b);
    for (let pad = 0; pad < 7; pad++) {
      const on = near ? (pad + Math.floor(time * 6)) % 3 === 0 : blink(time, 1.3, pad);
      rect(
        ctx,
        on ? [NEON.pink, NEON.cyan, NEON.yellow][pad % 3]! : "#4a4868",
        b.x + 4 + pad * 4,
        b.y + 2,
        2,
        2,
      );
    }
    if (near) {
      const key = Math.floor(time * 6) % 11;
      rect(ctx, NEON.cyan, b.x + 2 + key * 3, b.y + 8, 2, 4);
      for (let note = 0; note < 3; note++) {
        const age = (time * 0.6 + note / 3) % 1;
        ctx.save();
        ctx.globalAlpha = 1 - age;
        rect(ctx, NEON.pink, b.x + 8 + note * 8 + Math.sin(age * 6) * 2, b.y - 2 - age * 16, 2, 2);
        rect(ctx, NEON.pink, b.x + 9 + note * 8 + Math.sin(age * 6) * 2, b.y - 6 - age * 16, 1, 4);
        ctx.restore();
      }
    }
  },
  console: ({ ctx, time }, b, { near }) => {
    body(ctx, "console", b);
    const screen = { x: b.x + 4, y: b.y + 7, width: 14, height: 6 };
    // A tiny equaliser of the stack's languages.
    for (let bar = 0; bar < 7; bar++) {
      const height = 1 + Math.round((Math.sin(time * (near ? 8 : 3) + bar * 1.7) + 1) * 2.4);
      rect(
        ctx,
        bar % 2 ? NEON.cyan : NEON.green,
        screen.x + bar * 2,
        screen.y + screen.height - height,
        1,
        height,
      );
    }
    scanlines(ctx, screen, 0.25);
  },
  contributions: ({ ctx, time }, b, { levels = [], near }) => {
    body(ctx, "contributions", b);
    const ramp = ["#0f1a24", NEON.greenDim, "#2a9d6a", NEON.green, "#c8ffe0"];
    const sweep = Math.floor((time * 12) % 50);
    forEachDay(levels, 35, (week, day, level, isLatest) => {
      const x = b.x + 3 + week * 3;
      const y = b.y + 9 + day * 3;
      rect(ctx, ramp[level] ?? ramp[0]!, x, y, 2, 2);
      if (week === sweep) rect(ctx, "rgba(45, 226, 230, 0.45)", x, y, 2, 2);
      if (isLatest && blink(time, 0.4)) rect(ctx, NEON.pink, x, y, 2, 2);
    });
    // A ticker along the header strip.
    for (let dot = 0; dot < 34; dot++)
      if ((dot + Math.floor(time * 8)) % 6 < 3)
        rect(ctx, NEON.cyanDim, b.x + 4 + dot * 3, b.y + 3, 2, 2);
    if (near) glow(ctx, NEON.green, b.x + b.width / 2, b.y + b.height / 2, 50, 0.07);
  },
};

export function paintCityFurniture(
  frame: Frame,
  kind: FurnitureKind,
  bounds: Rect,
  details: FurnitureDetails,
  image?: HTMLImageElement,
) {
  painters[kind](frame, bounds, { ...details, image, near: isNear(frame, bounds) });
}
