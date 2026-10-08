import type { SocialLink } from "../../../content/types";
import type { Rect } from "../../engine/geometry";
import { drawHero } from "../character";
import { isNear } from "../exhibits";
import { paintSwitch } from "../wallSwitch";
import { rect } from "../pixel";
import { drawSprite, type SpriteSheet } from "../sprites";
import type { Frame, ThemeArt } from "../types";
import { kingdomActors } from "./actors";
import { buildingsFrom } from "./buildings";
import { furnitureFrom } from "./furniture";
import { paintKingdomGround } from "./ground";
import { KINGDOM } from "./palette";
import { KINGDOM_SHEETS, type KingdomSheets } from "./sheets";
import { kingdomProps, paintKingdomLights } from "./props";

const BRAND_RIBBON: Record<SocialLink["id"], string> = {
  linkedin: "#2f6fb5",
  github: "#3a3a3a",
  instagram: "#c2457a",
  youtube: "#c23b3b",
};

/** A wooden signpost with a ribbon in the brand colour; the label itself is HTML laid over it. */
const signpost =
  (sheet: SpriteSheet) =>
  ({ ctx, time }: Frame, brand: SocialLink["id"], b: Rect) => {
    rect(ctx, KINGDOM.shadow, b.x + 6, b.y + b.height - 1, b.width - 10, 2);
    drawSprite(ctx, sheet, "signpost", b.x, b.y);
    const flutter = Math.round(Math.sin(time * 3 + b.x) * 0.6);
    rect(ctx, BRAND_RIBBON[brand], b.x + b.width - 7, b.y + 14, 4, 6);
    rect(ctx, BRAND_RIBBON[brand], b.x + b.width - 7 + flutter, b.y + 20, 2, 2);
    rect(ctx, BRAND_RIBBON[brand], b.x + b.width - 5 - flutter, b.y + 20, 2, 1);
  };

/**
 * The kingdom's look, drawn from a set of sheets. The fantasy theme uses the originals; other styles
 * (the secret world) reuse the same painters with recoloured sheets and their own ground.
 */
export function createKingdomArt(sheets: KingdomSheets): ThemeArt {
  const buildings = buildingsFrom(sheets);
  return {
    ground: paintKingdomGround,
    building: (frame, kind, bounds) => buildings[kind](frame, bounds),
    sign: signpost(sheets.town),
    prop: kingdomProps(sheets),
    actor: kingdomActors(sheets),
    furniture: furnitureFrom(sheets),
    // A carved wooden arrow that glows gold when the visitor reaches for it.
    wallSwitch: (frame, direction, bounds) =>
      paintSwitch(
        frame.ctx,
        bounds,
        direction,
        {
          frame: "#4a2f27",
          face: "#b07f4f",
          arrow: "#5c3b17",
          lit: "#f0d27a",
          highlight: "#cfa36a",
        },
        isNear(frame, bounds, 26),
      ),
    character: ({ ctx, time }, player) => drawHero(ctx, sheets.creatures, player, time),
    foreground: paintKingdomLights,
  };
}

export const fantasyArt: ThemeArt = createKingdomArt(KINGDOM_SHEETS);
