import type { Rect } from "../engine/geometry";
import type { Motif } from "../../sections/types";
import type { FurnitureDetails } from "../world/world";
import { hash, rect, type Ctx } from "./pixel";
import type { Frame } from "./types";

/** A piece of furniture as its painter sees it: what makes it unique, plus whether the visitor is close. */
export interface Piece extends Omit<FurnitureDetails, "image"> {
  image?: HTMLImageElement;
  near: boolean;
}

/** Whether the player stands within reach of an object (measured from the middle of its base). */
export function isNear({ focus }: Frame, bounds: Rect, reach = 30): boolean {
  const dx = focus.x - (bounds.x + bounds.width / 2);
  const dy = focus.y - (bounds.y + bounds.height);
  return Math.hypot(dx, dy * 1.4) < reach;
}

/**
 * Walks a contribution calendar stored as week columns (7 days each, oldest first, -1 for padding),
 * keeping only the most recent `maxWeeks` so it fits the wall piece.
 */
export function forEachDay(
  levels: readonly number[],
  maxWeeks: number,
  paint: (week: number, day: number, level: number, isLatest: boolean) => void,
) {
  const weeks = Math.floor(levels.length / 7);
  const first = Math.max(0, weeks - maxWeeks);
  let latest = levels.length - 1;
  while (latest > 0 && levels[latest]! < 0) latest--;
  for (let week = first; week < weeks; week++) {
    for (let day = 0; day < 7; day++) {
      const index = week * 7 + day;
      const level = levels[index]!;
      if (level >= 0) paint(week - first, day, level, index === latest);
    }
  }
}

/**
 * Small animations shared by both themes' motif sprites (which sit 3px left of the rack footprint):
 * a ball bouncing down the Plinko board, notes from the jukebox, a blinking coin slot.
 */
export function animateMotif(ctx: Ctx, motif: Motif, b: Rect, time: number, near: boolean) {
  const x = b.x - 3;
  const y = b.y;
  switch (motif) {
    case "plinko": {
      const t = (time * 0.5) % 1;
      const row = Math.floor(t * 7);
      const zigzag = (row % 2 ? 1 : -1) * ((t * 7) % 1) * 2;
      rect(ctx, "#ffffff", x + 12 + zigzag + (row % 3) - 1, y + 3 + t * 20, 2, 2);
      return;
    }
    case "jukebox": {
      if (!near) return;
      for (let note = 0; note < 2; note++) {
        const age = (time * 0.6 + note / 2) % 1;
        ctx.save();
        ctx.globalAlpha = 1 - age;
        rect(ctx, "#ff8ad0", x + 6 + note * 12 + Math.sin(age * 6) * 2, y - 2 - age * 14, 2, 2);
        rect(ctx, "#ff8ad0", x + 7 + note * 12 + Math.sin(age * 6) * 2, y - 6 - age * 14, 1, 4);
        ctx.restore();
      }
      return;
    }
    case "arcade":
      if (Math.floor(time * 2) % 2) rect(ctx, "#ffffff", x + 11, y + 28, 4, 1);
      return;
    case "brain":
      if (Math.sin(time * 5) > 0.3)
        rect(ctx, "#ffffff", x + 9 + Math.round(hash(Math.floor(time * 5), 1) * 8), y + 9, 1, 1);
      return;
    case "database":
      for (let disk = 0; disk < 4; disk++)
        if (Math.sin(time * 6 + disk * 2) > 0)
          rect(ctx, "#ffffff", x + 20, y + 25 - disk * 7, 1, 1);
      return;
    default:
      return;
  }
}
