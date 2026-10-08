import type { Player } from "../engine/physics";
import { disc, type Ctx } from "./pixel";
import { drawSprite, type SpriteSheet } from "./sprites";

/**
 * Draws the player from a theme's creature sheet, which holds `hero-{down|up|side}-{0..3}` frames:
 * frame 0 is standing, 1–3 complete the walk cycle. Facing left mirrors the side frames.
 */
export function drawHero(ctx: Ctx, sheet: SpriteSheet, player: Player, time: number) {
  const x = Math.round(player.x);
  const y = Math.round(player.y);
  const step = player.moving ? Math.floor(time * 8) % 4 : 0;
  const side = player.facing === "left" || player.facing === "right";
  const direction = side ? "side" : player.facing;

  ctx.save();
  ctx.globalAlpha = 0.3;
  disc(ctx, "#000", x, y, 6, 2);
  ctx.restore();
  drawSprite(ctx, sheet, `hero-${direction}-${step}`, x, y + 1, player.facing === "left");
}
