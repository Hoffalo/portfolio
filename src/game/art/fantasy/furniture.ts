import type { Rect } from "../../engine/geometry";
import type { FurnitureKind, Motif } from "../../../sections/types";
import type { FurnitureDetails } from "../../world/world";
import { animateMotif, forEachDay, isNear, type Piece } from "../exhibits";
import { drawCover } from "../images";
import { disc, glow, hash, rect, type Ctx } from "../pixel";
import { drawSprite } from "../sprites";
import type { Frame } from "../types";
import { KINGDOM } from "./palette";
import type { KingdomSheets } from "./sheets";

type FurniturePainter = (frame: Frame, b: Rect, piece: Piece) => void;

/** Furniture painters drawing from the given sheets. */
export function furnitureFrom(sheets: KingdomSheets) {
  /** Sprite first, then whatever makes this particular piece unique. */
  const body = (ctx: Ctx, kind: FurnitureKind, b: Rect) => {
    ctx.save();
    ctx.globalAlpha = 0.25;
    rect(ctx, "#1d1410", b.x + 2, b.y + b.height - 1, b.width, 2);
    ctx.restore();
    drawSprite(ctx, sheets.interior, kind, b.x, b.y);
  };

  /**
   * A gilded frame: the picture if there is one, otherwise a "coming soon" clapperboard sketch.
   * A brass picture light above it brightens as the visitor walks up.
   */
  const gilded =
    (kind: FurnitureKind): FurniturePainter =>
    ({ ctx, time }, b, { image, near }) => {
      const inner = { x: b.x + 3, y: b.y + 3, width: b.width - 6, height: b.height - 6 };
      if (image) drawCover(ctx, image, inner.x, inner.y, inner.width, inner.height);
      else comingSoon(ctx, inner, time);
      drawSprite(ctx, sheets.interior, kind, b.x, b.y);
      const cx = b.x + b.width / 2;
      rect(ctx, KINGDOM.goldShade, cx - 4, b.y - 3, 8, 2);
      rect(ctx, KINGDOM.gold, cx - 4, b.y - 3, 8, 1);
      glow(ctx, "#fff0b8", cx, b.y + 4, b.width * 0.55, near ? 0.16 : 0.06);
    };

  function comingSoon(ctx: Ctx, area: Rect, time: number) {
    rect(ctx, "#3a2a2a", area.x, area.y, area.width, area.height);
    rect(ctx, "#4a3632", area.x + 1, area.y + 1, area.width - 2, area.height - 2);
    const cx = Math.round(area.x + area.width / 2);
    const cy = Math.round(area.y + area.height / 2);
    // A clapperboard whose arm snaps shut every few seconds.
    const snap = time % 3 < 0.25;
    rect(ctx, "#e6d6ae", cx - 6, cy - 1, 12, 7);
    rect(ctx, "#3a2a2a", cx - 5, cy + 1, 10, 1);
    rect(ctx, "#3a2a2a", cx - 5, cy + 3, 7, 1);
    rect(ctx, "#e6d6ae", cx - 6, cy - (snap ? 3 : 5), 12, 2);
    for (let stripe = 0; stripe < 3; stripe++)
      rect(ctx, "#3a2a2a", cx - 5 + stripe * 4, cy - (snap ? 3 : 5), 2, 2);
  }

  /** Notes drift up from the piano while someone stands at the keys. */
  function musicNotes(ctx: Ctx, x: number, y: number, time: number, color: string) {
    for (let note = 0; note < 3; note++) {
      const age = (time * 0.6 + note / 3) % 1;
      const nx = x + note * 7 + Math.sin(age * 6 + note) * 3;
      const ny = y - age * 18;
      ctx.save();
      ctx.globalAlpha = 1 - age;
      rect(ctx, color, nx, ny, 2, 2);
      rect(ctx, color, nx + 1, ny - 4, 1, 4);
      rect(ctx, color, nx + 2, ny - 4, 1, 1);
      ctx.restore();
    }
  }

  /** A project dressed as its subject (an arcade cabinet, a jukebox…) with a few living details. */
  function paintMotif(
    ctx: Ctx,
    motif: Motif,
    b: Rect,
    time: number,
    near: boolean,
    accent = "#9fe8ff",
  ) {
    ctx.save();
    ctx.globalAlpha = 0.25;
    rect(ctx, "#1d1410", b.x - 2, b.y + b.height - 1, b.width + 4, 2);
    ctx.restore();
    drawSprite(ctx, sheets.interior, `motif-${motif}`, b.x, b.y);
    animateMotif(ctx, motif, b, time, near);
    // A gem in the language's colour, so projects in the same language read as a family.
    rect(ctx, accent, b.x + b.width + 2, b.y + b.height - 4, 2, 2);
    rect(ctx, "#ffffff", b.x + b.width + 2, b.y + b.height - 4, 1, 1);
  }

  const STITCHES = ["#cdbb8e", "#93bb5c", "#6c9a47", "#4b7a3d", "#27402f"];

  const painters: Record<FurnitureKind, FurniturePainter> = {
    "painting-wide": gilded("painting-wide"),
    "painting-tall": gilded("painting-tall"),
    portrait: gilded("portrait"),
    screen: gilded("screen"),
    poster: ({ ctx }, b) => body(ctx, "poster", b),
    desk: ({ ctx, time }, b, { accent, lit, motif }) => {
      body(ctx, "desk", b);
      if (motif) drawSprite(ctx, sheets.interior, `motif-${motif}-small`, b.x - 14, b.y + 4);
      // A pennant in the organisation's colour hangs from the desk front.
      const color = accent ?? KINGDOM.banner;
      rect(ctx, KINGDOM.gold, b.x + 11, b.y + 12, 10, 1);
      rect(ctx, color, b.x + 12, b.y + 13, 8, 5);
      rect(ctx, color, b.x + 13, b.y + 18, 6, 1);
      rect(ctx, color, b.x + 15, b.y + 19, 2, 1);
      rect(ctx, "rgba(255,255,255,0.25)", b.x + 12, b.y + 13, 8, 1);
      if (lit) {
        const flicker = Math.sin(time * 10 + b.x) > 0 ? 1 : 0;
        rect(ctx, "#ff8c2a", b.x + 26, b.y - 1 - flicker, 3, 2 + flicker);
        rect(ctx, "#fff2c2", b.x + 27, b.y, 1, 1);
        glow(ctx, "#ffd98a", b.x + 27, b.y, 12, 0.12);
      } else {
        // A thin trail of smoke from a candle long since snuffed out.
        const age = (time * 0.4 + hash(b.x, 3)) % 1;
        ctx.save();
        ctx.globalAlpha = 0.35 * (1 - age);
        rect(ctx, "#d8d4ce", b.x + 27 + Math.sin(age * 8) * 1.5, b.y + 1 - age * 8, 1, 2);
        ctx.restore();
      }
    },
    rack: ({ ctx, time }, b, { accent, near, motif }) => {
      if (motif) return paintMotif(ctx, motif, b, time, near, accent);
      body(ctx, "rack", b);
      const color = accent ?? "#9fe8ff";
      const pulse = 0.5 + 0.5 * Math.sin(time * 2 + b.x);
      rect(ctx, color, b.x + 9, b.y - 4, 2, 4);
      rect(ctx, color, b.x + 8, b.y - 3, 4, 2);
      rect(ctx, "#ffffff", b.x + 9, b.y - 4, 1, 1);
      glow(ctx, color, b.x + 10, b.y - 2, near ? 12 : 8, 0.08 + pulse * 0.08);
    },
    bookshelf: ({ ctx }, b) => body(ctx, "bookshelf", b),
    globe: ({ ctx, time }, b, { near }) => {
      body(ctx, "globe", b);
      const cx = b.x + 8;
      const cy = b.y + 7;
      disc(ctx, "#2f6699", cx, cy, 6, 6);
      disc(ctx, "#3f86b8", cx - 1, cy - 1, 5, 5);
      // Continents slide across as the globe turns; a nudge sets it spinning faster.
      const spin = time * (near ? 6 : 1.5);
      for (let land = 0; land < 4; land++) {
        const x = ((spin * 2 + land * 4) % 14) - 7;
        if (Math.abs(x) > 5) continue;
        rect(
          ctx,
          land % 2 ? "#6c9a47" : "#93bb5c",
          cx + x,
          cy - 4 + land * 2 + (land % 2),
          3 - Math.round(Math.abs(x) / 3),
          2,
        );
      }
      rect(ctx, "#d4f0fa", cx - 3, cy - 4, 2, 1);
    },
    piano: ({ ctx, time }, b, { near }) => {
      body(ctx, "piano", b);
      rect(ctx, "#ff8c2a", b.x + 30, b.y - 6, 1, 2);
      if (near) {
        musicNotes(ctx, b.x + 8, b.y - 2, time, "#2b1d24");
        const key = Math.floor(time * 6) % 11;
        rect(ctx, "#c9c3b8", b.x + 1 + key * 3, b.y + 12, 2, 2);
      }
    },
    console: ({ ctx, time }, b, { near }) => {
      body(ctx, "console", b);
      const cx = b.x + 11;
      const cy = b.y + 5;
      for (let mote = 0; mote < 5; mote++) {
        const angle = time * (near ? 4 : 1.5) + mote * 1.3;
        rect(
          ctx,
          mote % 2 ? "#e6d8ff" : "#b9a0e6",
          cx + Math.cos(angle) * 3.5,
          cy + Math.sin(angle) * 2.5,
          1,
          1,
        );
      }
      glow(ctx, "#c9a8ff", cx, cy, near ? 14 : 9, 0.12);
    },
    contributions: ({ ctx, time }, b, { levels = [], near }) => {
      body(ctx, "contributions", b);
      // Each day is a cross-stitch: the more commits, the deeper the green.
      forEachDay(levels, 34, (week, day, level, isLatest) => {
        const x = b.x + 4 + week * 3;
        const y = b.y + 7 + day * 3;
        const color = STITCHES[level] ?? STITCHES[0]!;
        rect(ctx, color, x, y, 2, 2);
        if (level > 0) rect(ctx, "rgba(255,255,255,0.18)", x, y, 1, 1);
        if (isLatest && Math.sin(time * 4) > 0) rect(ctx, KINGDOM.gold, x, y, 2, 2);
      });
      if (near) glow(ctx, "#fff0b8", b.x + b.width / 2, b.y + b.height / 2, 50, 0.08);
    },
  };

  return (
    frame: Frame,
    kind: FurnitureKind,
    bounds: Rect,
    details: FurnitureDetails,
    image?: HTMLImageElement,
  ) => painters[kind](frame, bounds, { ...details, image, near: isNear(frame, bounds) });
}
