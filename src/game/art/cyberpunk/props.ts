import type { Rect, Vec } from "../../engine/geometry";
import type { Prop } from "../../world/world";
import { blink, disc, glow, hash, rect, sway, type Ctx } from "../pixel";
import { drawSprite } from "../sprites";
import type { Frame } from "../types";
import { CITY, NEON } from "./palette";
import { CITY_SHEET, CITY_INTERIOR } from "./sheets";

/** `focus` is where the player stands, for scenery that reacts to them. */
type PropPainter = (ctx: Ctx, prop: Prop, time: number, focus: Vec) => void;

function shadow(ctx: Ctx, b: Rect, widthScale = 0.5) {
  ctx.save();
  ctx.globalAlpha = 0.4;
  disc(ctx, CITY.shadow, b.x + b.width / 2 + 1, b.y + b.height - 1, b.width * widthScale + 1, 2);
  ctx.restore();
}

/** Draws the prop's sprite at its footprint, with a shadow underneath. */
const sprite =
  (id: string | ((prop: Prop) => string), shadowScale = 0.5) =>
  (ctx: Ctx, prop: Prop) => {
    if (shadowScale) shadow(ctx, prop.bounds, shadowScale);
    drawSprite(
      ctx,
      CITY_SHEET,
      typeof id === "string" ? id : id(prop),
      prop.bounds.x,
      prop.bounds.y,
    );
  };

const painters: Record<Prop["kind"], PropPainter> = {
  pet: (ctx, { bounds: b }, time, focus) => {
    // Napping until the visitor comes close, then it looks up.
    const awake = Math.hypot(focus.x - (b.x + 8), focus.y - (b.y + 8)) < 34;
    drawSprite(ctx, CITY_INTERIOR, awake ? "pet-1" : "pet-0", b.x, b.y);
    if (awake) return;
    for (let z = 0; z < 2; z++) {
      const age = (time * 0.5 + z / 2) % 1;
      ctx.save();
      ctx.globalAlpha = 1 - age;
      rect(ctx, "#2de2e6", b.x + 13 + age * 4, b.y - 2 - age * 8, 2, 1);
      rect(ctx, "#2de2e6", b.x + 14 + age * 4, b.y - 1 - age * 8, 1, 1);
      rect(ctx, "#2de2e6", b.x + 13 + age * 4, b.y - age * 8, 2, 1);
      ctx.restore();
    }
  },
  tree: (ctx, { bounds: b, seed }, time) => {
    const cx = Math.round(b.x + b.width / 2);
    shadow(ctx, { x: b.x - 2, y: b.y, width: b.width + 4, height: b.height });
    if (seed % 3 === 0) {
      drawSprite(ctx, CITY_SHEET, "palm", b.x - 2, b.y - 2);
      return;
    }
    drawSprite(ctx, CITY_SHEET, "trunk", cx - 7, b.y + b.height - 14);
    drawSprite(
      ctx,
      CITY_SHEET,
      `crown-${seed % 2}`,
      cx - 12 + sway(time, seed),
      b.y - 6,
      seed % 4 < 2,
    );
    // Fireflies of light drifting in the canopy.
    const accent = seed % 2 ? NEON.pink : NEON.cyan;
    for (let spark = 0; spark < 3; spark++) {
      if (Math.sin(time * 2 + spark + seed) < -0.2) continue;
      rect(
        ctx,
        accent,
        cx - 8 + hash(spark, seed) * 16,
        b.y - 2 + hash(spark, seed + 1) * 14,
        1,
        1,
      );
    }
  },
  bush: sprite("bush", 0.45),
  lamp: (ctx, prop, time) => {
    sprite("lamp", 0.3)(ctx, prop);
    // One in four lamps is faulty and stutters now and then.
    const b = prop.bounds;
    const faulty = prop.seed % 4 === 0 && blink(time, 0.13) && Math.sin(time * 0.7) > 0.8;
    if (faulty) rect(ctx, CITY.steel, b.x + 6, b.y + 4, 4, 1);
  },
  bench: sprite("bench"),
  flowers: (ctx, { bounds: b, seed }) =>
    drawSprite(ctx, CITY_SHEET, `flowers-${seed % 3}`, b.x, b.y - 1),
  mushrooms: (ctx, { bounds: b, seed }, time) => {
    drawSprite(ctx, CITY_SHEET, `mushrooms-${seed % 2}`, b.x, b.y);
    if (Math.sin(time * 1.5 + seed) > 0.4)
      glow(ctx, seed % 2 ? NEON.green : NEON.cyan, b.x + 4, b.y + 2, 5, 0.08);
  },
  rock: sprite((prop) => `rock-${prop.seed % 2}`, 0.45),
  fountain: (ctx, prop, time) => {
    const b = prop.bounds;
    shadow(ctx, b, 0.52);
    drawSprite(ctx, CITY_SHEET, "fountain", b.x, b.y);
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height - 12;
    for (let ripple = 0; ripple < 10; ripple++) {
      const angle = hash(ripple, 5) * Math.PI * 2 + time * 0.6;
      const radius = 5 + ((time * 6 + ripple * 3) % 12);
      rect(
        ctx,
        NEON.cyan,
        cx + Math.cos(angle) * radius,
        cy + Math.sin(angle) * radius * 0.42,
        1,
        1,
      );
    }
    // A spinning hologram crystal over the projector.
    const float = Math.round(Math.sin(time * 2) * 1.5);
    const spin = Math.abs(Math.cos(time * 1.4));
    ctx.save();
    ctx.globalAlpha = 0.85;
    for (let row = 0; row < 13; row++) {
      const half = Math.round((row < 7 ? row : 12 - row) * spin * 0.9) + 1;
      const color = (row + Math.floor(time * 5)) % 4 ? NEON.cyan : NEON.pink;
      rect(ctx, color, cx - half, b.y + row + float, half * 2, 1);
    }
    ctx.restore();
    rect(ctx, "#c8ffff", cx - 1, b.y + 4 + float, 1, 3);
  },
  plant: (ctx, prop, time) => {
    shadow(ctx, prop.bounds, 0.4);
    drawSprite(ctx, CITY_SHEET, "plant", prop.bounds.x, prop.bounds.y, sway(time, prop.seed) > 0);
  },
  campfire: (ctx, prop, time) => {
    // A burning oil drum: the city's campfire.
    const b = prop.bounds;
    shadow(ctx, b, 0.35);
    drawSprite(ctx, CITY_SHEET, "campfire", b.x, b.y);
    const cx = b.x + b.width / 2;
    for (let flame = 0; flame < 4; flame++) {
      const height = 3 + Math.round((Math.sin(time * 12 + flame * 2) + 1) * 2);
      rect(ctx, flame % 2 ? "#ff8c2a" : "#ffcf4a", cx - 4 + flame * 2, b.y + 4 - height, 2, height);
    }
    rect(
      ctx,
      "#ffcf4a",
      cx + Math.round(Math.sin(time * 3) * 3),
      b.y - 4 - ((time * 10) % 10),
      1,
      1,
    );
  },
  fence: (ctx, { bounds: b }) => {
    if (b.width >= b.height) {
      rect(ctx, CITY.steelDark, b.x, b.y - 2, b.width, 1);
      rect(ctx, CITY.steel, b.x, b.y - 1, b.width, 1);
      rect(ctx, CITY.steelDark, b.x, b.y + 2, b.width, 1);
      rect(ctx, CITY.steel, b.x, b.y + 1, b.width, 1);
      for (let x = b.x; x < b.x + b.width; x += 8)
        drawSprite(ctx, CITY_SHEET, "fence-post", x, b.y - 4);
    } else {
      rect(ctx, CITY.steel, b.x + 1, b.y, 1, b.height);
      for (let y = b.y; y < b.y + b.height; y += 8)
        drawSprite(ctx, CITY_SHEET, "fence-post", b.x, y - 4);
    }
  },
  barrel: sprite((prop) => `barrel-${prop.seed % 2}`, 0.55),
  crate: sprite("crate", 0.55),
  stall: (ctx, prop, time) => {
    // A ramen stand; steam rises from the bowls.
    sprite("stall")(ctx, prop);
    const b = prop.bounds;
    for (let puff = 0; puff < 3; puff++) {
      const age = (time * 0.7 + puff / 3) % 1;
      ctx.save();
      ctx.globalAlpha = 0.45 * (1 - age);
      disc(ctx, "#d8d4ee", b.x + 6 + puff * 9 + Math.sin(age * 6) * 2, b.y + 16 - age * 14, 2, 2);
      ctx.restore();
    }
  },
  barn: (ctx, prop, time) => {
    // The garage: its neon sign flickers.
    sprite("barn", 0.5)(ctx, prop);
    const b = prop.bounds;
    const sign = Math.sin(time * 9) > -0.6 ? NEON.green : NEON.greenDim;
    for (let glyph = 0; glyph < 4; glyph++) rect(ctx, sign, b.x + 59 + glyph * 5, b.y + 31, 3, 5);
    for (let vent = 0; vent < 3; vent++)
      rect(
        ctx,
        "#4a4868",
        b.x + 9 + vent * 22,
        b.y + 7 + (Math.floor(time * 8 + vent) % 3) * 2,
        10,
        1,
      );
  },
  vehicle: (ctx, prop, time) => {
    // A low hover car with a pulsing underglow.
    const b = prop.bounds;
    const hover = Math.round(Math.sin(time * 2.5));
    const underglow = Math.sin(time * 3) > 0 ? NEON.pink : NEON.violet;
    ctx.save();
    ctx.globalAlpha = 0.45;
    disc(ctx, underglow, b.x + b.width / 2, b.y + b.height - 2, b.width / 2 + 2, 3);
    ctx.restore();
    drawSprite(ctx, CITY_SHEET, "vehicle", b.x, b.y + 2 + hover);
  },
  cart: (ctx, { bounds: b }, time) => {
    // A drone landing pad with its drone hovering above.
    drawSprite(ctx, CITY_SHEET, "pad", b.x, b.y + b.height - 10);
    const y = b.y + Math.round(Math.sin(time * 3) * 2);
    drawSprite(ctx, CITY_SHEET, "drone", b.x + 4, y);
    const spin = Math.floor(time * 20) % 2;
    rect(ctx, "#8b8aac", b.x + 4 + spin, y, 3, 1);
    rect(ctx, "#8b8aac", b.x + 16 + spin, y, 3, 1);
    rect(ctx, blink(time, 0.3) ? NEON.red : NEON.green, b.x + 11, y + 2, 2, 1);
  },
  trough: (ctx, { bounds: b }, time) => {
    // A charging pylon for the yard bots.
    drawSprite(ctx, CITY_SHEET, "trough", b.x, b.y - 10);
    const level = Math.floor(time * 2) % 4;
    for (let bar = 0; bar < 4; bar++)
      rect(ctx, bar <= level ? NEON.green : NEON.greenDim, b.x + 4, b.y - 1 - bar * 2, 3, 1);
  },
};

export function paintCityProp({ ctx, time, focus }: Frame, prop: Prop) {
  painters[prop.kind](ctx, prop, time, focus);
}

/** Neon, fire and lamplight spill, drawn after everything so it brightens what it falls on. */
export function paintCityLights({ ctx, world, time }: Frame) {
  for (const { kind, bounds: b } of world.props) {
    if (kind === "lamp") glow(ctx, NEON.cyan, b.x + 8, b.y + 7, 16, 0.1);
    if (kind === "fountain")
      glow(ctx, NEON.cyan, b.x + b.width / 2, b.y + 10, 20, 0.08 + 0.04 * Math.sin(time * 2));
    if (kind === "campfire")
      glow(ctx, "#ff8c2a", b.x + b.width / 2, b.y + 4, 22, 0.12 + 0.03 * Math.sin(time * 9));
    if (kind === "stall") glow(ctx, NEON.pink, b.x + b.width / 2, b.y + 12, 22, 0.08);
    if (kind === "vehicle") glow(ctx, NEON.pink, b.x + b.width / 2, b.y + b.height, 26, 0.08);
  }
  for (const fixture of world.fixtures) {
    if (fixture.visual.type === "building") {
      const door = fixture.visual.door;
      glow(ctx, NEON.pink, door.x + door.width / 2, door.y + door.height - 4, 9, 0.07);
    }
  }
}

/** Rain falls across the view rather than the world, so it never scrolls with the camera. */
export function paintRain({ ctx, view, time }: Frame) {
  ctx.fillStyle = "rgba(150, 200, 255, 0.35)";
  for (let drop = 0; drop < 80; drop++) {
    const x = (hash(drop, 3) * view.width + time * 20) % view.width;
    const y = (hash(drop, 4) * view.height + time * 160) % view.height;
    ctx.fillRect(Math.round(view.x + x), Math.round(view.y + y), 1, 3);
  }
}
