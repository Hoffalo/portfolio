import type { Rect } from "../../engine/geometry";
import { createKingdomArt } from "../fantasy";
import type { ThemeArt } from "../types";
import { isNear } from "../exhibits";
import { drawSprite } from "../sprites";
import { paintSwitch } from "../wallSwitch";
import { awardCoin, collectCoins, paintCoinCounter, paintCoins } from "./coins";
import { paintRetroGround } from "./ground";
import { RETRO_SHEETS, SECRET_SHEET } from "./sheets";

const kingdom = createKingdomArt(RETRO_SHEETS);

/** Blocks above doors, keyed by door position, that have already given up their coin. */
const emptied = new Set<string>();
const BUMP_SECONDS = 0.25;
const bumpedAt = new Map<string, number>();

/**
 * Every door has a "?" block floating over it. Walk up to it and it bumps, pops a coin and goes
 * dark, once per session.
 */
function questionBlock(
  ctx: CanvasRenderingContext2D,
  door: Rect,
  focus: { x: number; y: number },
  time: number,
) {
  const key = `${door.x},${door.y}`;
  const x = Math.round(door.x + door.width / 2 - 8);
  const y = door.y - 30;
  const near =
    Math.abs(focus.x - (door.x + door.width / 2)) < 10 && focus.y - (door.y + door.height) < 14;
  if (near && !emptied.has(key)) {
    emptied.add(key);
    bumpedAt.set(key, time);
    awardCoin();
  }
  const since = time - (bumpedAt.get(key) ?? -Infinity);
  const bump =
    since < BUMP_SECONDS ? -Math.round(Math.sin((since / BUMP_SECONDS) * Math.PI) * 4) : 0;
  const id = emptied.has(key) ? "qblock-used" : `qblock-${Math.floor(time * 3) % 3 === 2 ? 1 : 0}`;
  drawSprite(ctx, SECRET_SHEET, id, x, y + bump);
  // The coin it gave up flies out and fades.
  if (since < 0.6) {
    const rise = since / 0.6;
    drawSprite(ctx, SECRET_SHEET, `coin-${Math.floor(since * 16) % 4}`, x + 8, y - rise * 18);
  }
}

/**
 * The Konami-code secret world: the kingdom redrawn in the NES palette, with a bright blue sky,
 * dotted hills, a warp pipe in the square, "?" blocks over the doors, coins to collect and
 * underground bonus rooms.
 */
export const retroArt: ThemeArt = {
  ...kingdom,
  ground: paintRetroGround,
  wallSwitch: (frame, direction, bounds) =>
    paintSwitch(
      frame.ctx,
      bounds,
      direction,
      { frame: "#fcfcfc", face: "#000000", arrow: "#fcfcfc", lit: "#f8b800", highlight: "#000000" },
      isNear(frame, bounds, 26),
    ),
  building: (frame, kind, bounds, door) => {
    kingdom.building(frame, kind, bounds, door);
    questionBlock(frame.ctx, door, frame.focus, frame.time);
  },
  prop: (frame, prop) => {
    if (prop.kind !== "fountain") return kingdom.prop(frame, prop);
    // The fountain becomes a warp pipe.
    const b = prop.bounds;
    drawSprite(frame.ctx, SECRET_SHEET, "pipe", b.x + 7, b.y + b.height - 40);
  },
  foreground: ({ ctx, world, view, time, focus }) => {
    collectCoins(world, focus);
    paintCoins(ctx, world, time);
    paintCoinCounter(ctx, view);
  },
};
