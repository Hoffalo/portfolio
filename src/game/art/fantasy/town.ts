import type { Rect } from "../../engine/geometry";
import type { PathSegment, TownGround } from "../../world/world";
import { paintBackdropLayer, paintSkyGradient } from "../backdrop";
import { disc, forEachTile, glow, hash, rect, stroke } from "../pixel";
import { drawSprite, tilePattern } from "../sprites";
import type { Frame } from "../types";
import { KINGDOM } from "./palette";
import { BACKDROP } from "./sprites/backdrop";
import backdropUrl from "./sprites/backdrop.png";
import { KINGDOM_TILES as TILE_SHEET } from "./sheets";

export function paintKingdomTown(frame: Frame, ground: TownGround) {
  paintSky(frame, ground.horizon);
  paintMeadow(frame, ground.horizon);
  paintRiver(frame, {
    ...ground.river,
    x: -KINGDOM_EXTENT,
    width: frame.world.width + KINGDOM_EXTENT * 2,
  });
  paintPlankBridge(frame, ground.bridge);
  paintFarmyard(frame, ground);
  ground.paths.forEach((path) => paintDirtPath(frame, path));
  paintCobbles(frame, ground.plaza);
}

const SKY_BANDS = ["#5f9ee0", "#6eaae6", "#80b6ec", "#93c2f0", "#a8cff3", "#bedcf6", "#d3e8f8"];
const BACKDROP_SHEET = { url: backdropUrl, frames: BACKDROP };
/** How far the scenery is painted past the world's edges; matches the forest overhang in the layout. */
export const KINGDOM_EXTENT = 160;

function paintSky(frame: Frame, horizon: number) {
  const { ctx, view, time } = frame;
  paintSkyGradient(frame, SKY_BANDS, horizon);

  // The sun barely moves with the camera, as befits something very far away.
  const sunX = Math.round(view.x * 0.92 + 70);
  const sunY = Math.round(Math.min(view.y, 0) * 0.5 + 34);
  glow(ctx, "#fff6c8", sunX, sunY, 34, 0.18);
  disc(ctx, "#fff3b8", sunX, sunY, 13, 13);
  disc(ctx, "#fffbe6", sunX - 2, sunY - 2, 9, 9);

  paintBackdropLayer(frame, BACKDROP_SHEET, "far", horizon - 6, 0.12);

  for (let cloud = 0; cloud < 7; cloud++) {
    const span = view.width + 140;
    const drift = time * (2 + (cloud % 3) * 0.9);
    const x = view.x * 0.8 + ((((hash(cloud, 31) * span + drift) % span) + span) % span) - 70;
    const y = horizon - 130 + hash(cloud, 32) * 70;
    drawSprite(ctx, BACKDROP_SHEET, `cloud-${cloud % 3}`, x, y);
  }

  // A few birds wheeling over the hills.
  for (let bird = 0; bird < 4; bird++) {
    const x =
      view.x + ((hash(bird, 60) * view.width + time * (9 + bird * 2)) % (view.width + 20)) - 10;
    const y = horizon - 70 + hash(bird, 61) * 30 + Math.sin(time * 1.3 + bird) * 4;
    const up = Math.floor(time * 5 + bird) % 2;
    rect(ctx, "#3a4458", x - 2, y - up, 2, 1);
    rect(ctx, "#3a4458", x + 1, y - up, 2, 1);
    rect(ctx, "#3a4458", x, y + (up ? 0 : -1) + 1, 1, 1);
  }

  paintBackdropLayer(frame, BACKDROP_SHEET, "near", horizon + 6, 0.3);
}

function paintMeadow({ ctx, world, view, time }: Frame, horizon: number) {
  const left = -KINGDOM_EXTENT;
  const width = world.width + KINGDOM_EXTENT * 2;
  rect(
    ctx,
    tilePattern(ctx, TILE_SHEET, "grass") ?? KINGDOM.grass,
    left,
    horizon,
    width,
    world.height - horizon,
  );
  // A few taller tufts bend in the breeze; scattered petals add colour between the props.
  const flowers = ["#f5c84c", "#e65f73", "#f4f0ff", "#a77be0"];
  forEachTile(view, 8, (x, y, column, row) => {
    if (y < horizon + 4 || y >= world.height) return;
    const roll = hash(column * 997 + row, 9);
    if (roll < 0.09) {
      const bend = Math.sin(time * 1.6 + column * 0.4) > 0.6 ? 1 : 0;
      const tx = x + Math.round(roll * 60);
      rect(ctx, "#4d7039", tx, y + 4, 1, 3);
      rect(ctx, "#4d7039", tx + 2, y + 5, 1, 2);
      rect(ctx, "#86ad5c", tx + bend, y + 3, 1, 1);
      rect(ctx, "#86ad5c", tx + 2 + bend, y + 4, 1, 1);
    } else if (roll > 0.985) rect(ctx, flowers[column % flowers.length]!, x + 3, y + 3, 1, 1);
  });
}

function paintRiver({ ctx, time }: Frame, river: Rect) {
  // Sandy, stony banks, then deep water fading to a lighter channel.
  rect(ctx, "#7a5c3c", river.x, river.y - 4, river.width, river.height + 8);
  rect(ctx, "#b89a6a", river.x, river.y - 3, river.width, 2);
  rect(ctx, "#9a7a50", river.x, river.y + river.height + 1, river.width, 2);
  const bands = ["#24476e", "#2f6699", "#3f86b8", "#4f95c2", "#3f86b8", "#2f6699"];
  const band = river.height / bands.length;
  bands.forEach((color, index) =>
    rect(ctx, color, river.x, river.y + index * band, river.width, Math.ceil(band)),
  );
  for (let stone = 0; stone < river.width; stone += 7) {
    const roll = hash(stone, 16);
    if (roll < 0.5)
      disc(ctx, roll < 0.25 ? "#8f8a91" : "#6d6875", river.x + stone, river.y - 2, 2, 1);
    if (roll > 0.6) disc(ctx, "#6d6875", river.x + stone + 3, river.y + river.height + 2, 2, 1);
  }
  for (let ripple = 0; ripple < 60; ripple++) {
    const x =
      river.x + ((hash(ripple, 11) * river.width + time * (8 + (ripple % 3) * 5)) % river.width);
    const y = river.y + 3 + Math.floor(hash(ripple, 12) * (river.height - 6));
    rect(ctx, ripple % 5 ? KINGDOM.waterLight : "#e6f6fb", x, y, 2 + (ripple % 4), 1);
  }
  for (let pad = 0; pad < 14; pad++) {
    const x = river.x + hash(pad, 13) * river.width;
    const y = river.y + 5 + hash(pad, 14) * 10;
    disc(ctx, "#355a35", x, y + 1, 3, 2);
    disc(ctx, "#5c8642", x, y, 3, 2);
    rect(ctx, "#3f86b8", x, y - 1, 2, 2);
    if (pad % 4 === 0) rect(ctx, "#f4c4d8", x - 1, y - 1, 2, 1);
  }
  // Every few seconds a fish leaps somewhere along the river.
  const cycle = 3.2;
  const leap = Math.floor(time / cycle);
  const t = (time % cycle) / 0.9;
  if (t < 1) {
    const x = hash(leap, 15) * (river.width - 400) + 200 + river.x + t * 10;
    const y = river.y + 10 - Math.sin(t * Math.PI) * 9;
    rect(ctx, "#e58b3a", x, y, 4, 2);
    rect(ctx, "#c46a2a", x - 1, y + 1, 1, 1);
    rect(ctx, "#ffffff", x + 3, y, 1, 1);
  }
  for (let reed = 0; reed < river.width; reed += 13) {
    if (hash(reed, 17) < 0.45) continue;
    const bend = Math.sin(time * 1.4 + reed) > 0.5 ? 1 : 0;
    const x = river.x + reed;
    rect(ctx, "#4d7039", x + bend, river.y + river.height - 2, 1, 5);
    rect(ctx, "#4d7039", x + 2, river.y + river.height - 1, 1, 4);
    rect(ctx, "#6b4630", x + bend, river.y + river.height - 4, 1, 2);
  }
}

function paintDirtPath({ ctx }: Frame, path: PathSegment) {
  // A grassy fringe, a trodden darker edge, then the packed dirt texture.
  stroke(ctx, "#5c8642", path.from, path.to, path.width + 4);
  stroke(ctx, "#7a5c3c", path.from, path.to, path.width + 2);
  stroke(ctx, tilePattern(ctx, TILE_SHEET, "dirt") ?? KINGDOM.path, path.from, path.to, path.width);
  const length = Math.hypot(path.to.x - path.from.x, path.to.y - path.from.y);
  for (let distance = 6; distance < length; distance += 9) {
    const t = distance / length;
    const offset = (hash(distance, 3) - 0.5) * (path.width + 4);
    if (Math.abs(offset) < path.width / 2 + 1) continue;
    rect(
      ctx,
      "#86ad5c",
      path.from.x + (path.to.x - path.from.x) * t + offset,
      path.from.y + (path.to.y - path.from.y) * t,
      1,
      2,
    );
  }
}

function paintCobbles({ ctx }: Frame, plaza: Rect) {
  const cx = plaza.x + plaza.width / 2;
  const cy = plaza.y + plaza.height / 2;
  disc(ctx, "#5c8642", cx, cy + 1, plaza.width / 2 + 3, plaza.height / 2 + 3);
  disc(ctx, "#6d6875", cx, cy + 1, plaza.width / 2 + 1, plaza.height / 2 + 1);
  disc(ctx, "#b3aeac", cx, cy, plaza.width / 2 + 1, plaza.height / 2 + 1);
  disc(
    ctx,
    tilePattern(ctx, TILE_SHEET, "cobble") ?? KINGDOM.plaza,
    cx,
    cy,
    plaza.width / 2 - 1,
    plaza.height / 2 - 1,
  );
}

/** Grass worn into dirt where the animals walk, and a muddy pen. */
function paintFarmyard({ ctx }: Frame, { yard, pen }: TownGround) {
  const dirt = tilePattern(ctx, TILE_SHEET, "dirt") ?? "#9c8458";
  for (let patch = 0; patch < 12; patch++) {
    const x = yard.x + hash(patch, 50) * yard.width;
    const y = yard.y + hash(patch, 51) * yard.height;
    const r = 10 + hash(patch, 52) * 10;
    disc(ctx, "#7a5c3c", x, y + 1, r + 1, 5);
    disc(ctx, dirt, x, y, r, 4);
  }
  rect(ctx, "#5e4630", pen.x, pen.y, pen.width, pen.height);
  rect(ctx, dirt, pen.x + 2, pen.y + 2, pen.width - 4, pen.height - 4);
  for (let puddle = 0; puddle < 3; puddle++) {
    const x = pen.x + 20 + puddle * 40;
    const y = pen.y + 30 + (puddle % 2) * 30;
    disc(ctx, "#4a3420", x, y + 1, 9, 4);
    disc(ctx, "#6b5234", x, y, 8, 3);
    rect(ctx, "#8a7050", x - 3, y - 1, 3, 1);
  }
}

function paintPlankBridge({ ctx }: Frame, bridge: Rect) {
  rect(ctx, KINGDOM.shadow, bridge.x + 2, bridge.y + 3, bridge.width, bridge.height);
  drawSprite(ctx, TILE_SHEET, "bridge", bridge.x, bridge.y);
}
