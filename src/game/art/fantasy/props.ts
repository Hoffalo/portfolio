import type { Rect, Vec } from "../../engine/geometry";
import type { Prop } from "../../world/world";
import { disc, glow, hash, rect, sway, type Ctx } from "../pixel";
import { drawSprite } from "../sprites";
import type { Frame } from "../types";
import { torchPositions } from "./interior";
import { KINGDOM } from "./palette";
import type { KingdomSheets } from "./sheets";

/** `focus` is where the player stands, for scenery that reacts to them. */
type PropPainter = (ctx: Ctx, prop: Prop, time: number, focus: Vec) => void;

/** A soft oval shadow grounding a prop. */
function shadow(ctx: Ctx, b: Rect, widthScale = 0.5) {
  ctx.save();
  ctx.globalAlpha = 0.25;
  disc(ctx, "#1d1a10", b.x + b.width / 2 + 1, b.y + b.height - 1, b.width * widthScale + 1, 2);
  ctx.restore();
}

/** Scenery painters drawing from the given sheets. */
export function kingdomProps(sheets: KingdomSheets) {
  /** Draws the prop's sprite at its footprint, with a shadow underneath. */
  const sprite =
    (id: string | ((prop: Prop) => string), shadowScale = 0.5) =>
    (ctx: Ctx, prop: Prop) => {
      if (shadowScale) shadow(ctx, prop.bounds, shadowScale);
      drawSprite(
        ctx,
        sheets.town,
        typeof id === "string" ? id : id(prop),
        prop.bounds.x,
        prop.bounds.y,
      );
    };

  const painters: Record<Prop["kind"], PropPainter> = {
    pet: (ctx, { bounds: b }, time, focus) => {
      // Napping until the visitor comes close, then it looks up.
      const awake = Math.hypot(focus.x - (b.x + 8), focus.y - (b.y + 8)) < 34;
      drawSprite(ctx, sheets.interior, awake ? "pet-1" : "pet-0", b.x, b.y);
      if (awake) return;
      for (let z = 0; z < 2; z++) {
        const age = (time * 0.5 + z / 2) % 1;
        ctx.save();
        ctx.globalAlpha = 1 - age;
        rect(ctx, "#f4ead0", b.x + 13 + age * 4, b.y - 2 - age * 8, 2, 1);
        rect(ctx, "#f4ead0", b.x + 14 + age * 4, b.y - 1 - age * 8, 1, 1);
        rect(ctx, "#f4ead0", b.x + 13 + age * 4, b.y - age * 8, 2, 1);
        ctx.restore();
      }
    },
    tree: (ctx, { bounds: b, seed }, time) => {
      const cx = Math.round(b.x + b.width / 2);
      shadow(ctx, { x: b.x - 2, y: b.y, width: b.width + 4, height: b.height });
      if (seed % 3 === 0) {
        drawSprite(ctx, sheets.town, "pine", b.x, b.y - 4);
        return;
      }
      drawSprite(ctx, sheets.town, "trunk", cx - 4, b.y + b.height - 12);
      const crown = hash(seed, 4) > 0.7 ? "oak-1" : "oak-0";
      drawSprite(ctx, sheets.town, crown, cx - 13 + sway(time, seed), b.y - 4, seed % 2 === 0);
    },
    bush: sprite((prop) => `bush-${prop.seed % 2}`, 0.45),
    lamp: (ctx, prop, time) => {
      sprite("lamp", 0.3)(ctx, prop);
      const b = prop.bounds;
      // The flame gutters now and then.
      if (Math.sin(time * 7 + prop.seed) > 0.85) rect(ctx, "#e0a050", b.x + 1, b.y + 3, 5, 4);
      rect(ctx, "#fff7d0", b.x + 3, b.y + 4, 1, 2);
    },
    bench: sprite("bench"),
    flowers: (ctx, { bounds: b, seed }) =>
      drawSprite(ctx, sheets.town, `flowers-${seed % 3}`, b.x, b.y - 1),
    mushrooms: sprite((prop) => `mushrooms-${prop.seed % 2}`, 0),
    rock: sprite((prop) => `rock-${prop.seed % 2}`, 0.45),
    fountain: (ctx, prop, time) => {
      const b = prop.bounds;
      shadow(ctx, b, 0.52);
      drawSprite(ctx, sheets.town, "fountain", b.x, b.y);
      const cx = b.x + 24;
      // Sparkles drifting on the basin, rings where the falling water lands.
      for (let sparkle = 0; sparkle < 10; sparkle++) {
        const phase = (time * 0.5 + hash(sparkle, 6)) % 1;
        const angle = hash(sparkle, 7) * Math.PI * 2;
        const radius = 0.45 + phase * 0.5;
        rect(
          ctx,
          KINGDOM.waterLight,
          cx + Math.cos(angle) * 17 * radius,
          b.y + 32 + Math.sin(angle) * 6 * radius,
          phase > 0.5 ? 1 : 2,
          1,
        );
      }
      // Water spilling over both bowls.
      for (let drop = 0; drop < 12; drop++) {
        const t = (time * 1.3 + drop / 12) % 1;
        const side = drop % 2 ? 1 : -1;
        const upper = drop % 4 < 2;
        const x = cx + side * ((upper ? 6 : 10) + t * 2);
        const y = b.y + (upper ? 7 : 18) + t * t * (upper ? 10 : 13);
        rect(ctx, t > 0.8 ? "#ffffff" : KINGDOM.waterLight, x, y, 1, 2);
      }
      const jet = Math.round(Math.sin(time * 6));
      rect(ctx, "#e6f6fb", cx, b.y - 3 - jet, 1, 3 + jet);
    },
    plant: (ctx, prop, time) => {
      shadow(ctx, prop.bounds, 0.4);
      drawSprite(
        ctx,
        sheets.town,
        "plant",
        prop.bounds.x,
        prop.bounds.y,
        sway(time, prop.seed) > 0,
      );
    },
    campfire: (ctx, prop, time) => {
      const b = prop.bounds;
      drawSprite(ctx, sheets.town, "campfire", b.x, b.y);
      const cx = b.x + b.width / 2;
      const base = b.y + 9;
      for (let flame = 0; flame < 5; flame++) {
        const height =
          3 + Math.round((Math.sin(time * 11 + flame * 1.7) + 1) * 2.5) - Math.abs(flame - 2);
        rect(
          ctx,
          ["#c43b1e", "#ff8c2a", "#ffcf4a", "#ff8c2a", "#c43b1e"][flame]!,
          cx - 3 + flame * 1.5,
          base - height,
          2,
          height,
        );
      }
      rect(ctx, "#fff4c2", cx - 1, base - 4, 2, 3);
      for (let spark = 0; spark < 3; spark++) {
        const age = (time * 0.9 + spark / 3) % 1;
        rect(ctx, "#ffcf4a", cx + Math.sin(age * 9 + spark) * 3, base - 8 - age * 14, 1, 1);
      }
    },
    fence: (ctx, { bounds: b }) => {
      if (b.width >= b.height) {
        rect(ctx, "#4a2f27", b.x, b.y - 3, b.width, 3);
        rect(ctx, "#a37a4c", b.x, b.y - 3, b.width, 1);
        rect(ctx, "#8d613d", b.x, b.y - 2, b.width, 1);
        rect(ctx, "#4a2f27", b.x, b.y + 1, b.width, 3);
        rect(ctx, "#a37a4c", b.x, b.y + 1, b.width, 1);
        rect(ctx, "#8d613d", b.x, b.y + 2, b.width, 1);
        for (let x = b.x; x < b.x + b.width; x += 10)
          drawSprite(ctx, sheets.town, "fence-post", x, b.y - 5);
      } else {
        rect(ctx, "#4a2f27", b.x, b.y, 3, b.height);
        rect(ctx, "#a37a4c", b.x + 1, b.y, 1, b.height);
        for (let y = b.y; y < b.y + b.height; y += 10)
          drawSprite(ctx, sheets.town, "fence-post", b.x, y - 5);
      }
    },
    barrel: sprite("barrel", 0.55),
    crate: sprite("crate", 0.55),
    stall: (ctx, prop, time) => {
      sprite("stall")(ctx, prop);
      // The sign swings gently on its chain.
      const swing = Math.round(Math.sin(time * 1.5));
      if (swing)
        rect(ctx, "#ece2c6", prop.bounds.x + (swing > 0 ? 22 : 12), prop.bounds.y + 13, 1, 3);
    },
    barn: (ctx, prop, time) => {
      sprite("barn", 0.5)(ctx, prop);
      const b = prop.bounds;
      // The weathervane's arrow turns with the breeze.
      const vane = Math.sin(time * 0.5) > 0 ? 1 : -1;
      rect(ctx, "#45424f", b.x + 42 + (vane > 0 ? 4 : -5), b.y - 6, 1, 1);
    },
    vehicle: (ctx, prop, time) => {
      sprite("vehicle", 0.45)(ctx, prop);
      const b = prop.bounds;
      if (Math.sin(time * 6) > -0.7) rect(ctx, "#fff2c2", b.x + 40, b.y + 7, 1, 2);
    },
    cart: sprite("cart", 0.45),
    trough: (ctx, prop, time) => {
      sprite("trough", 0.5)(ctx, prop);
      const b = prop.bounds;
      if (Math.sin(time * 2) > 0.3)
        rect(ctx, "#d4f0fa", b.x + 4 + (Math.round(time * 3) % 11), b.y + 2, 2, 1);
    },
  };

  return ({ ctx, time, focus }: Frame, prop: Prop) => painters[prop.kind](ctx, prop, time, focus);
}

/** Warm lantern and firelight in the town, torchlight indoors. */
export function paintKingdomLights({ ctx, world, time }: Frame) {
  for (const { kind, bounds: b } of world.props) {
    if (kind === "lamp") glow(ctx, "#ffd98a", b.x + 3, b.y + 5, 10, 0.1);
    if (kind === "campfire")
      glow(ctx, "#ffb347", b.x + b.width / 2, b.y + 4, 22, 0.12 + 0.03 * Math.sin(time * 9));
  }
  if (world.ground.type === "room") {
    const flicker = 0.1 + 0.03 * Math.sin(time * 9);
    for (const x of torchPositions(world.ground.windows)) {
      glow(ctx, "#ffb347", x, world.ground.wallHeight - 22, 16, flicker);
    }
  }
}
