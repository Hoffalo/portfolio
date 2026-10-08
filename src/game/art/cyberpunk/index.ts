import type { SocialLink } from "../../../content/types";
import type { Rect } from "../../engine/geometry";
import { drawHero } from "../character";
import { isNear } from "../exhibits";
import { paintSwitch } from "../wallSwitch";
import { rect } from "../pixel";
import { drawSprite } from "../sprites";
import type { Frame, ThemeArt } from "../types";
import { paintCityActor } from "./actors";
import { cyberBuildings } from "./buildings";
import { paintCityFurniture } from "./furniture";
import { paintCityGround } from "./ground";
import { CITY, NEON } from "./palette";
import { CITY_CREATURES, CITY_SHEET } from "./sheets";
import { paintCityLights, paintCityProp, paintRain } from "./props";

const BRAND_NEON: Record<SocialLink["id"], string> = {
  linkedin: NEON.blue,
  github: NEON.violet,
  instagram: NEON.pink,
  youtube: NEON.red,
};

/** A holo-billboard on two posts; the label itself is HTML laid over it. */
function paintBillboard({ ctx, time }: Frame, brand: SocialLink["id"], b: Rect) {
  const color = BRAND_NEON[brand];
  rect(ctx, CITY.shadow, b.x + 2, b.y + b.height - 1, b.width - 4, 2);
  drawSprite(ctx, CITY_SHEET, "billboard", b.x, b.y);
  // A neon border in the brand colour, with a light chasing around it.
  rect(ctx, color, b.x, b.y, b.width, 1);
  rect(ctx, color, b.x, b.y + 13, b.width, 1);
  rect(ctx, color, b.x, b.y, 1, 14);
  rect(ctx, color, b.x + b.width - 1, b.y, 1, 14);
  const chase = Math.floor(time * 20) % b.width;
  rect(ctx, "#ffffff", b.x + chase, b.y, 2, 1);
  rect(ctx, "#ffffff", b.x + b.width - 1 - chase, b.y + 13, 2, 1);
}

export const cyberpunkArt: ThemeArt = {
  ground: paintCityGround,
  building: (frame, kind, bounds) => cyberBuildings[kind](frame, bounds),
  sign: paintBillboard,
  prop: paintCityProp,
  actor: paintCityActor,
  furniture: paintCityFurniture,
  // A neon arrow panel that brightens when the visitor walks up.
  wallSwitch: (frame, direction, bounds) =>
    paintSwitch(
      frame.ctx,
      bounds,
      direction,
      {
        frame: NEON.cyanDim,
        face: "#0d0a1c",
        arrow: NEON.cyanDim,
        lit: NEON.cyan,
        highlight: "#1d4a5a",
      },
      isNear(frame, bounds, 26),
    ),
  character: ({ ctx, time }, player) => drawHero(ctx, CITY_CREATURES, player, time),
  foreground: (frame) => {
    paintCityLights(frame);
    if (frame.world.kind === "town") paintRain(frame);
  },
};
