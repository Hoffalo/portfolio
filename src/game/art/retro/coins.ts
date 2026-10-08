import type { Vec } from "../../engine/geometry";
import { feetBox } from "../../engine/physics";
import { isBlockedIn, type World } from "../../world/world";
import { playCoin } from "../../../shared/chiptune";
import { rect, type Ctx } from "../pixel";
import { drawSprite } from "../sprites";
import { SECRET_SHEET } from "./sheets";

/**
 * Coins scattered through the secret world: along the town's paths and down each room's middle
 * aisle. They are placed only where the player can actually stand, and stay collected for the visit.
 */
const placed = new WeakMap<World, Vec[]>();
const collected = new WeakMap<World, Set<number>>();
let total = 0;

const REACH = 8;

function coinsIn(world: World): Vec[] {
  const cached = placed.get(world);
  if (cached) return cached;
  const candidates: Vec[] = [];
  if (world.ground.type === "town") {
    for (const { from, to } of world.ground.paths) {
      const length = Math.hypot(to.x - from.x, to.y - from.y);
      // Leave the ends clear: one end is the warp pipe, the other a doorstep.
      for (let distance = 36; distance < length - 20; distance += 22) {
        const t = distance / length;
        candidates.push({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t });
      }
    }
  } else {
    const x = world.width / 2;
    for (let y = world.ground.wallHeight + 14; y < world.height - 30; y += 16)
      candidates.push({ x, y });
  }
  const isBlocked = isBlockedIn(world);
  const coins = candidates.filter((spot) => !isBlocked(feetBox(spot)));
  placed.set(world, coins);
  return coins;
}

/** Picks up any coin within reach of the player, with a chime for each. */
export function collectCoins(world: World, focus: Vec): void {
  const taken = collected.get(world) ?? new Set<number>();
  collected.set(world, taken);
  coinsIn(world).forEach((coin, index) => {
    if (taken.has(index) || Math.hypot(coin.x - focus.x, coin.y - focus.y) > REACH) return;
    taken.add(index);
    awardCoin();
  });
}

export function awardCoin() {
  total++;
  playCoin();
}

export function paintCoins(ctx: Ctx, world: World, time: number) {
  const taken = collected.get(world);
  coinsIn(world).forEach((coin, index) => {
    if (taken?.has(index)) return;
    const spin = Math.floor(time * 8 + index) % 4;
    const bob = Math.round(Math.sin(time * 3 + index) * 1.5);
    drawSprite(ctx, SECRET_SHEET, `coin-${spin}`, coin.x, coin.y - 4 + bob);
  });
}

// A 3×5 digit font for the coin counter, one string per row.
const DIGITS = [
  "111101101101111",
  "010110010010111",
  "111001111100111",
  "111001111001111",
  "101101111001001",
  "111100111001111",
  "111100111101111",
  "111001001001001",
  "111101111101111",
  "111101111001111",
];

function digit(ctx: Ctx, value: number, x: number, y: number, color: string) {
  const bits = DIGITS[value]!;
  for (let index = 0; index < 15; index++)
    if (bits[index] === "1") rect(ctx, color, x + (index % 3), y + Math.floor(index / 3), 1, 1);
}

/** The coin counter in the corner of the screen: a coin, "×", and two digits. */
export function paintCoinCounter(ctx: Ctx, view: { x: number; y: number; width: number }) {
  const x = Math.round(view.x + view.width - 30);
  const y = Math.round(view.y + 6);
  rect(ctx, "#000000", x - 3, y - 3, 30, 15);
  drawSprite(ctx, SECRET_SHEET, "coin-0", x + 3, y + 11);
  rect(ctx, "#fcfcfc", x + 9, y + 3, 1, 1);
  rect(ctx, "#fcfcfc", x + 11, y + 3, 1, 1);
  rect(ctx, "#fcfcfc", x + 10, y + 4, 1, 1);
  rect(ctx, "#fcfcfc", x + 9, y + 5, 1, 1);
  rect(ctx, "#fcfcfc", x + 11, y + 5, 1, 1);
  const shown = Math.min(99, total);
  digit(ctx, Math.floor(shown / 10), x + 15, y + 2, "#fcfcfc");
  digit(ctx, shown % 10, x + 19, y + 2, "#fcfcfc");
}
