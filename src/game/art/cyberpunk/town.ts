import type { Rect } from "../../engine/geometry";
import type { PathSegment, TownGround } from "../../world/world";
import { paintBackdropLayer, paintSkyGradient } from "../backdrop";
import { blink, disc, forEachTile, glow, hash, rect, stroke } from "../pixel";
import { drawSprite, tilePattern } from "../sprites";
import type { Frame } from "../types";
import { CITY, NEON } from "./palette";
import { BACKDROP } from "./sprites/backdrop";
import backdropUrl from "./sprites/backdrop.png";
import { CITY_TILES } from "./sheets";

export function paintCityTown(frame: Frame, ground: TownGround) {
  paintSkyline(frame, ground.horizon);
  paintAsphalt(frame, ground.horizon);
  paintCanal(frame, {
    ...ground.river,
    x: -CITY_EXTENT,
    width: frame.world.width + CITY_EXTENT * 2,
  });
  paintGrateBridge(frame, ground.bridge);
  paintLot(frame, ground);
  ground.paths.forEach((path) => paintWalkway(frame, path));
  paintPlaza(frame, ground.plaza);
}

const SKY_BANDS = ["#05020f", "#08031a", "#0d0424", "#14062f", "#1e0a3b", "#2a0d47", "#3a1052"];
const BACKDROP_SHEET = { url: backdropUrl, frames: BACKDROP };
/** How far the scenery is painted past the world's edges; matches the forest overhang in the layout. */
export const CITY_EXTENT = 160;

function paintSkyline(frame: Frame, horizon: number) {
  const { ctx, view, time } = frame;
  paintSkyGradient(frame, SKY_BANDS, horizon);

  for (let star = 0; star < 70; star++) {
    if (Math.sin(time * (1 + (star % 4)) + star * 7) < -0.4) continue;
    const x = view.x * 0.95 + hash(star, 1) * (view.width + 40) - 20;
    rect(ctx, star % 9 ? "#8e84c8" : "#e6e0ff", x, horizon - 150 + hash(star, 2) * 90, 1, 1);
  }

  // A huge violet moon behind the arcology, banded by drifting smog.
  const moonX = Math.round(view.x * 0.94 + view.width * 0.7);
  const moonY = horizon - 112;
  glow(ctx, "#b45cff", moonX, moonY, 46, 0.12);
  disc(ctx, "#f2d4ff", moonX, moonY, 18, 18);
  disc(ctx, "#ffeefe", moonX - 3, moonY - 3, 13, 13);
  disc(ctx, "#dcb2f0", moonX + 6, moonY + 4, 3, 3);
  disc(ctx, "#dcb2f0", moonX - 6, moonY + 7, 2, 2);
  disc(ctx, "#e6c4f6", moonX - 4, moonY - 8, 2, 2);
  for (let smog = 0; smog < 3; smog++) {
    const y = moonY - 2 + smog * 6;
    const drift = Math.round((time * (3 + smog) + smog * 17) % 50) - 25;
    rect(ctx, SKY_BANDS[3 + smog]!, moonX - 22 + drift, y, 44 - smog * 6, 1);
  }

  paintBackdropLayer(frame, BACKDROP_SHEET, "far", horizon - 4, 0.12);

  // Searchlights sweeping the smog from behind the near towers.
  ctx.save();
  ctx.globalAlpha = 0.07;
  for (let beam = 0; beam < 3; beam++) {
    const baseX = view.x + view.width * (0.2 + beam * 0.32);
    const angle = Math.sin(time * 0.35 + beam * 2.1) * 0.5;
    ctx.fillStyle = beam === 1 ? NEON.pink : NEON.cyan;
    ctx.beginPath();
    ctx.moveTo(baseX, horizon - 30);
    ctx.lineTo(baseX + Math.sin(angle - 0.06) * 200, horizon - 30 - Math.cos(angle - 0.06) * 200);
    ctx.lineTo(baseX + Math.sin(angle + 0.06) * 200, horizon - 30 - Math.cos(angle + 0.06) * 200);
    ctx.fill();
  }
  ctx.restore();

  // An advertising blimp drifting across, its screen cycling through ads.
  const blimpSpan = view.width + 120;
  const blimpX = view.x + ((((time * 6) % blimpSpan) + blimpSpan) % blimpSpan) - 60;
  const blimpY = horizon - 118 + Math.round(Math.sin(time * 0.8) * 2);
  if (drawSprite(ctx, BACKDROP_SHEET, "blimp", blimpX, blimpY)) {
    const ad = Math.floor(time / 2.5) % 3;
    const colors = [NEON.pink, NEON.cyan, NEON.yellow];
    for (let row = 0; row < 8; row++) {
      const lit = (row + Math.floor(time * 8)) % 4 !== 0;
      rect(ctx, lit ? colors[ad]! : NEON.pinkDim, blimpX - 14, blimpY - 6 + row, 28, 1);
    }
    for (let glyph = 0; glyph < 5; glyph++)
      rect(ctx, "#140a2e", blimpX - 11 + glyph * 5, blimpY - 4, 3, 4);
    if (blink(time, 0.6)) rect(ctx, NEON.red, blimpX + 25, blimpY - 1, 1, 1);
  }

  paintBackdropLayer(frame, BACKDROP_SHEET, "near", horizon + 2, 0.32);

  // Hover traffic in three lanes; the nearest lane is above the near towers.
  for (let car = 0; car < 6; car++) {
    const lane = car % 3;
    const speed = [24, -18, 34][lane]! * (1 + (car >> 1) * 0.2);
    const span = view.width + 60;
    const offset = hash(car, 70) * span;
    const x = view.x + ((((time * speed + offset) % span) + span) % span) - 30;
    const y = horizon - 96 + lane * 14;
    drawSprite(ctx, BACKDROP_SHEET, `car-${car % 2}`, x, y, speed < 0);
    const tail = speed > 0 ? -1 : 1;
    rect(ctx, speed > 0 ? NEON.cyan : NEON.pink, x + tail * 8, y, 1, 1);
    ctx.save();
    ctx.globalAlpha = 0.25;
    rect(ctx, speed > 0 ? NEON.cyan : NEON.pink, x + (tail > 0 ? 8 : -20), y, 12, 1);
    ctx.restore();
  }
}

function paintAsphalt({ ctx, world, view }: Frame, horizon: number) {
  const left = -CITY_EXTENT;
  rect(
    ctx,
    tilePattern(ctx, CITY_TILES, "asphalt") ?? CITY.asphalt,
    left,
    horizon,
    world.width + CITY_EXTENT * 2,
    world.height - horizon,
  );
  // Puddles that mirror the neon.
  forEachTile(view, 16, (x, y, column, row) => {
    if (y < horizon + 8 || y >= world.height) return;
    const roll = hash(column * 977 + row, 3);
    if (roll > 0.965) {
      disc(ctx, CITY.puddle, x + 8, y + 8, 7, 2);
      rect(ctx, roll > 0.985 ? NEON.pinkDim : NEON.cyanDim, x + 4, y + 7, 4, 1);
      rect(ctx, "#2a3a5a", x + 10, y + 8, 2, 1);
    }
  });
}

function paintCanal({ ctx, time }: Frame, river: Rect) {
  rect(ctx, "#06101e", river.x, river.y, river.width, river.height);
  const bands = ["#081a30", "#0a2140", "#0e2a4e", "#0a2140"];
  bands.forEach((color, index) =>
    rect(ctx, color, river.x, river.y + 3 + index * 4, river.width, 4),
  );
  for (let ripple = 0; ripple < 60; ripple++) {
    const x =
      river.x + ((hash(ripple, 11) * river.width + time * (8 + (ripple % 3) * 4)) % river.width);
    const y = river.y + 4 + Math.floor(hash(ripple, 12) * (river.height - 8));
    rect(ctx, ripple % 4 ? NEON.cyanDim : NEON.pinkDim, x, y, 3 + (ripple % 3), 1);
  }
  // Holo koi drifting downstream.
  for (let koi = 0; koi < 4; koi++) {
    const span = river.width + 30;
    const x = river.x + ((time * (14 + koi * 6) + koi * 210) % span) - 15;
    const y = river.y + 7 + (koi % 2) * 6 + Math.round(Math.sin(time * 2 + koi) * 1.5);
    rect(ctx, koi % 2 ? NEON.pink : NEON.cyan, x, y, 5, 2);
    rect(ctx, koi % 2 ? NEON.pinkDim : NEON.cyanDim, x - 2, y + (Math.floor(time * 6) % 2), 2, 1);
  }
  // Steel quay walls with bollards and a neon safety strip.
  for (const [edge, lit] of [
    [river.y - 3, true],
    [river.y + river.height, false],
  ] as const) {
    rect(ctx, CITY.steelDark, river.x, edge, river.width, 3);
    rect(ctx, lit ? CITY.plateEdge : CITY.steel, river.x, edge, river.width, 1);
    for (let x = river.x + 4; x < river.x + river.width; x += 16)
      rect(ctx, CITY.plateEdge, x, edge - 3, 2, 3);
    if (lit)
      for (let x = river.x; x < river.x + river.width; x += 6)
        rect(ctx, NEON.cyanDim, x, edge + 2, 3, 1);
  }
}

function paintWalkway({ ctx }: Frame, path: PathSegment) {
  stroke(ctx, CITY.shadow, path.from, path.to, path.width + 4);
  stroke(ctx, CITY.plateEdge, path.from, path.to, path.width + 2);
  stroke(ctx, tilePattern(ctx, CITY_TILES, "plate") ?? CITY.plate, path.from, path.to, path.width);
  const length = Math.hypot(path.to.x - path.from.x, path.to.y - path.from.y);
  for (let distance = 18; distance < length - 8; distance += 14) {
    const t = distance / length;
    rect(
      ctx,
      NEON.cyanDim,
      path.from.x + (path.to.x - path.from.x) * t,
      path.from.y + (path.to.y - path.from.y) * t,
      1,
      1,
    );
  }
}

function paintPlaza({ ctx, time }: Frame, plaza: Rect) {
  const cx = plaza.x + plaza.width / 2;
  const cy = plaza.y + plaza.height / 2;
  disc(ctx, CITY.shadow, cx, cy + 2, plaza.width / 2 + 3, plaza.height / 2 + 3);
  disc(
    ctx,
    blink(time, 1.2) ? NEON.cyan : NEON.cyanDim,
    cx,
    cy,
    plaza.width / 2 + 1,
    plaza.height / 2 + 1,
  );
  disc(
    ctx,
    tilePattern(ctx, CITY_TILES, "hex") ?? CITY.plazaA,
    cx,
    cy,
    plaza.width / 2,
    plaza.height / 2,
  );
  // A ring of light sweeping round the square.
  for (let dot = 0; dot < 32; dot++) {
    const angle = (dot / 32) * Math.PI * 2;
    const lit = (dot + Math.floor(time * 8)) % 8 === 0;
    rect(
      ctx,
      lit ? "#c8ffff" : NEON.cyanDim,
      cx + Math.cos(angle) * (plaza.width / 2 - 4),
      cy + Math.sin(angle) * (plaza.height / 2 - 3),
      1,
      1,
    );
  }
}

/** The garage lot: concrete, parking bays, and a charging pad with hazard stripes for the bots. */
function paintLot({ ctx }: Frame, { yard, pen }: TownGround) {
  rect(
    ctx,
    tilePattern(ctx, CITY_TILES, "lot") ?? "#201f2c",
    yard.x,
    yard.y,
    yard.width,
    yard.height,
  );
  for (let x = yard.x + 100; x < pen.x - 20; x += 24)
    rect(ctx, "#4a4868", x, yard.y + yard.height - 34, 1, 26);
  rect(ctx, "#101a1a", pen.x, pen.y, pen.width, pen.height);
  rect(
    ctx,
    tilePattern(ctx, CITY_TILES, "plate") ?? "#1a2626",
    pen.x + 2,
    pen.y + 2,
    pen.width - 4,
    pen.height - 4,
  );
  for (let x = pen.x; x < pen.x + pen.width; x += 4) {
    const color = (x / 4) % 2 ? NEON.yellow : "#111";
    rect(ctx, color, x, pen.y + 3, 2, 2);
    rect(ctx, color, x, pen.y + pen.height - 5, 2, 2);
  }
}

function paintGrateBridge({ ctx, time }: Frame, bridge: Rect) {
  rect(ctx, CITY.shadow, bridge.x + 2, bridge.y + 3, bridge.width, bridge.height);
  drawSprite(ctx, CITY_TILES, "bridge", bridge.x, bridge.y);
  const rail = blink(time, 1.1) ? NEON.cyan : NEON.cyanDim;
  rect(ctx, rail, bridge.x - 1, bridge.y - 3, 1, bridge.height + 3);
  rect(ctx, rail, bridge.x + bridge.width, bridge.y - 3, 1, bridge.height + 3);
}
