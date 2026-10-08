import type { Rect } from "../../engine/geometry";
import type { RoomGround } from "../../world/world";
import { rect } from "../pixel";
import { drawSprite, tilePattern } from "../sprites";
import type { Frame } from "../types";
import { KINGDOM } from "./palette";
import { KINGDOM_TILES } from "./sheets";

/** A torch beside every window; shared with the lighting pass so flames and glow line up. */
export const torchPositions = (windows: readonly Rect[]) => windows.map((window) => window.x - 7);

export function paintHall({ ctx, world, time }: Frame, ground: RoomGround) {
  const { width, height } = world;
  const { wallHeight, rug, mat, windows } = ground;

  rect(ctx, tilePattern(ctx, KINGDOM_TILES, "wall") ?? KINGDOM.wallStone, 0, 0, width, wallHeight);
  windows.forEach((window) => drawSprite(ctx, KINGDOM_TILES, "window", window.x, window.y));
  for (const x of torchPositions(windows)) {
    drawSprite(ctx, KINGDOM_TILES, "torch", x - 1, wallHeight - 25);
    const flicker = Math.round(Math.sin(time * 11 + x) * 1);
    rect(ctx, "#c43b1e", x - 1, wallHeight - 29 - flicker, 3, 4 + flicker);
    rect(ctx, "#ff8c2a", x - 1, wallHeight - 28 - flicker, 3, 3 + flicker);
    rect(ctx, "#ffe08a", x, wallHeight - 27 - flicker, 1, 2);
  }

  rect(
    ctx,
    tilePattern(ctx, KINGDOM_TILES, "floor") ?? KINGDOM.floor,
    0,
    wallHeight,
    width,
    height - wallHeight,
  );
  // The wall casts a soft shadow onto the floor.
  ctx.save();
  ctx.globalAlpha = 0.25;
  rect(ctx, "#1d1410", 0, wallHeight, width, 3);
  rect(ctx, "#1d1410", 0, wallHeight, width, 1);
  ctx.restore();

  paintRug(ctx, rug);

  // Thick stone side walls, lit on their inner face.
  for (const x of [0, width - 8]) {
    rect(ctx, "#4f4a58", x, 0, 8, height);
    rect(ctx, x === 0 ? "#8f8a91" : "#36323f", x === 0 ? 7 : x, 0, 1, height);
  }
  rect(ctx, "#4f4a58", 0, height - 4, width, 4);
  rect(ctx, "#8f8a91", 8, height - 4, width - 16, 1);
  rect(ctx, "#6b4630", mat.x, mat.y, mat.width, mat.height);
  for (let x = mat.x + 1; x < mat.x + mat.width - 1; x += 2)
    rect(ctx, x % 4 ? "#b07f4f" : "#8d613d", x, mat.y + 1, 1, mat.height - 3);
}

/** A red rug with a woven gold border and a diamond medallion pattern. */
function paintRug(ctx: Frame["ctx"], rug: Rect) {
  rect(ctx, "#4a1622", rug.x - 1, rug.y - 1, rug.width + 2, rug.height + 2);
  rect(ctx, KINGDOM.rug, rug.x, rug.y, rug.width, rug.height);
  rect(ctx, "#a8392e", rug.x + 4, rug.y + 4, rug.width - 8, rug.height - 8);
  rect(ctx, KINGDOM.rug, rug.x + 6, rug.y + 6, rug.width - 12, rug.height - 12);
  for (let x = rug.x + 2; x < rug.x + rug.width - 2; x += 3) {
    rect(ctx, KINGDOM.gold, x, rug.y + 2, 2, 1);
    rect(ctx, KINGDOM.gold, x, rug.y + rug.height - 3, 2, 1);
  }
  for (let y = rug.y + 2; y < rug.y + rug.height - 2; y += 3) {
    rect(ctx, KINGDOM.gold, rug.x + 2, y, 1, 2);
    rect(ctx, KINGDOM.gold, rug.x + rug.width - 3, y, 1, 2);
  }
  for (let y = rug.y + 14; y < rug.y + rug.height - 10; y += 16) {
    for (let x = rug.x + 16; x < rug.x + rug.width - 12; x += 22) {
      for (let k = 0; k < 4; k++) {
        rect(ctx, "#c95a3d", x - k, y + k, 1, 1);
        rect(ctx, "#c95a3d", x + k, y + k, 1, 1);
        rect(ctx, "#c95a3d", x - k, y + 6 - k, 1, 1);
        rect(ctx, "#c95a3d", x + k, y + 6 - k, 1, 1);
      }
      rect(ctx, KINGDOM.gold, x, y + 3, 1, 1);
    }
  }
  for (let x = rug.x; x < rug.x + rug.width; x += 2) {
    rect(ctx, KINGDOM.goldShade, x, rug.y - 2, 1, 1);
    rect(ctx, KINGDOM.goldShade, x, rug.y + rug.height + 1, 1, 1);
  }
}
