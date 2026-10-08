import type { Rect } from "../../engine/geometry";
import type { RoomGround } from "../../world/world";
import { hash, rect } from "../pixel";
import { drawSprite, tilePattern } from "../sprites";
import type { Frame } from "../types";
import { CITY, NEON } from "./palette";
import { CITY_TILES } from "./sheets";

export function paintInterior({ ctx, world, time }: Frame, ground: RoomGround) {
  const { width, height } = world;
  const { wallHeight, rug, mat, windows } = ground;

  rect(ctx, tilePattern(ctx, CITY_TILES, "wall") ?? CITY.wall, 0, 0, width, wallHeight);
  rect(ctx, NEON.violet, 0, 2, width, 1);
  windows.forEach((window, index) => paintCityWindow(ctx, window, index, time));
  rect(ctx, NEON.cyanDim, 0, wallHeight - 1, width, 1);

  rect(
    ctx,
    tilePattern(ctx, CITY_TILES, "floor") ?? CITY.floorA,
    0,
    wallHeight,
    width,
    height - wallHeight,
  );
  ctx.save();
  ctx.globalAlpha = 0.35;
  rect(ctx, "#000", 0, wallHeight, width, 3);
  ctx.restore();

  // A dark rug with glowing edge strips that pulse slowly.
  const pulse = Math.sin(time * 1.5) > 0 ? NEON.cyan : NEON.cyanDim;
  rect(ctx, "#0b0918", rug.x - 1, rug.y - 1, rug.width + 2, rug.height + 2);
  rect(ctx, CITY.rug, rug.x, rug.y, rug.width, rug.height);
  rect(ctx, pulse, rug.x + 2, rug.y + 2, rug.width - 4, 1);
  rect(ctx, pulse, rug.x + 2, rug.y + rug.height - 3, rug.width - 4, 1);
  rect(ctx, NEON.pinkDim, rug.x + 2, rug.y + 2, 1, rug.height - 4);
  rect(ctx, NEON.pinkDim, rug.x + rug.width - 3, rug.y + 2, 1, rug.height - 4);
  for (let y = rug.y + 8; y < rug.y + rug.height - 6; y += 8)
    for (let x = rug.x + 8; x < rug.x + rug.width - 6; x += 8)
      if (hash(x, y) > 0.7) rect(ctx, "#2a2450", x, y, 2, 1);

  for (const x of [0, width - 8]) {
    rect(ctx, CITY.steelDark, x, 0, 8, height);
    rect(ctx, x === 0 ? CITY.plateEdge : "#14131f", x === 0 ? 7 : x, 0, 1, height);
  }
  rect(ctx, CITY.steelDark, 0, height - 4, width, 4);
  rect(ctx, CITY.steel, mat.x, mat.y, mat.width, mat.height);
  for (let x = mat.x + 2; x < mat.x + mat.width - 1; x += 3)
    rect(ctx, CITY.shadow, x, mat.y + 1, 1, mat.height - 2);
  rect(ctx, NEON.green, mat.x, mat.y + mat.height - 1, mat.width, 1);
}

/** A window onto the rainy skyline; the rain streaks are animated over the sprite. */
function paintCityWindow(ctx: Frame["ctx"], window: Rect, seed: number, time: number) {
  drawSprite(ctx, CITY_TILES, "window", window.x, window.y);
  for (let drop = 0; drop < 5; drop++) {
    const y = (hash(drop, seed) * window.height + time * 40) % window.height;
    rect(ctx, "rgba(150, 200, 255, 0.5)", window.x + 2 + drop * 5, window.y + y, 1, 2);
  }
}
