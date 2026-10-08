import type { Rect } from "../../engine/geometry";
import type { PathSegment, RoomGround, TownGround } from "../../world/world";
import { paintBackdropLayer } from "../backdrop";
import { disc, hash, rect, stroke, type Ctx } from "../pixel";
import { drawSprite, tilePattern } from "../sprites";
import type { Frame } from "../types";
import { SECRET_SHEET } from "./sheets";

/** The secret world's sky: one flat, bright blue, as on the NES. */
export const RETRO_SKY = "#6888fc";
const BLACK = "#000000";
/** Matches the forest overhang in the town layout, so the edges never show. */
const EXTENT = 160;

export function paintRetroGround(frame: Frame) {
  const { ctx, world, view } = frame;
  rect(ctx, BLACK, view.x, view.y, view.width, view.height);
  if (world.ground.type === "town") paintTown(frame, world.ground);
  else paintUnderground(frame, world.ground);
}

function paintTown(frame: Frame, ground: TownGround) {
  const { ctx, world, view, time } = frame;
  const { horizon } = ground;
  rect(
    ctx,
    RETRO_SKY,
    view.x - 1,
    Math.min(view.y, 0) - 1,
    view.width + 2,
    horizon - Math.min(view.y, 0) + 1,
  );

  // Clouds drift slowly; a little castle waits on the far side of the hills.
  for (let cloud = 0; cloud < 6; cloud++) {
    const span = view.width + 120;
    const x = view.x * 0.85 + ((((hash(cloud, 31) * span + time * 3) % span) + span) % span) - 60;
    drawSprite(ctx, SECRET_SHEET, `cloud-${cloud % 2}`, x, horizon - 130 + hash(cloud, 32) * 60);
  }
  drawSprite(
    ctx,
    SECRET_SHEET,
    "castle",
    Math.round(view.x * 0.9 + view.width * 0.78),
    horizon - 8,
  );
  paintBackdropLayer(frame, SECRET_SHEET, "hills", horizon, 0.2);
  for (let x = -EXTENT; x < world.width + EXTENT; x += 70)
    drawSprite(
      ctx,
      SECRET_SHEET,
      `bush-${Math.floor(hash(x, 5) * 2)}`,
      x + hash(x, 6) * 30,
      horizon + 2,
    );

  const grass = tilePattern(ctx, SECRET_SHEET, "grass") ?? "#00a800";
  rect(ctx, grass, -EXTENT, horizon, world.width + EXTENT * 2, world.height - horizon);

  paintWater(ctx, { ...ground.river, x: -EXTENT, width: world.width + EXTENT * 2 }, time);
  outlined(ctx, ground.bridge, tilePattern(ctx, SECRET_SHEET, "brick") ?? "#e45c10");

  const blocks = tilePattern(ctx, SECRET_SHEET, "ground") ?? "#e45c10";
  outlined(ctx, ground.yard, blocks);
  outlined(ctx, ground.pen, tilePattern(ctx, SECRET_SHEET, "brick") ?? "#e45c10");
  ground.paths.forEach((path) => paintBlockPath(ctx, path, blocks));
  const { plaza } = ground;
  const cx = plaza.x + plaza.width / 2;
  const cy = plaza.y + plaza.height / 2;
  disc(ctx, BLACK, cx, cy, plaza.width / 2 + 1, plaza.height / 2 + 1);
  disc(
    ctx,
    tilePattern(ctx, SECRET_SHEET, "brick") ?? "#e45c10",
    cx,
    cy,
    plaza.width / 2,
    plaza.height / 2,
  );
}

function paintWater(ctx: Ctx, river: Rect, time: number) {
  outlined(
    ctx,
    { ...river, y: river.y - 4, height: river.height + 8 },
    tilePattern(ctx, SECRET_SHEET, "ground") ?? "#e45c10",
  );
  // The water pattern scrolls sideways a pixel at a time.
  ctx.save();
  ctx.translate(Math.floor(time * 6) % 16, 0);
  rect(
    ctx,
    tilePattern(ctx, SECRET_SHEET, "water") ?? "#0078f8",
    river.x - 16,
    river.y,
    river.width + 16,
    river.height,
  );
  ctx.restore();
}

function paintBlockPath(ctx: Ctx, path: PathSegment, blocks: string | CanvasPattern) {
  stroke(ctx, BLACK, path.from, path.to, path.width + 2);
  stroke(ctx, blocks, path.from, path.to, path.width);
}

function outlined(ctx: Ctx, area: Rect, fill: string | CanvasPattern) {
  rect(ctx, BLACK, area.x - 1, area.y - 1, area.width + 2, area.height + 2);
  rect(ctx, fill, area.x, area.y, area.width, area.height);
}

/** Rooms become underground bonus rooms: blue bricks, black void and pipes down from the ceiling. */
function paintUnderground({ ctx, world }: Frame, ground: RoomGround) {
  const { width, height } = world;
  const { wallHeight, windows, mat } = ground;
  rect(ctx, tilePattern(ctx, SECRET_SHEET, "cave-brick") ?? "#0058f8", 0, 0, width, wallHeight);
  rect(
    ctx,
    tilePattern(ctx, SECRET_SHEET, "cave-floor") ?? "#0078f8",
    0,
    wallHeight,
    width,
    height - wallHeight,
  );
  rect(ctx, BLACK, 0, wallHeight - 1, width, 1);
  // Where the windows were, pipes reach down from above.
  for (const window of windows)
    paintCeilingPipe(ctx, window.x + window.width / 2 - 8, wallHeight - 4);
  for (const x of [0, width - 8])
    rect(ctx, tilePattern(ctx, SECRET_SHEET, "cave-brick") ?? "#0058f8", x, 0, 8, height);
  rect(ctx, BLACK, 7, 0, 1, height);
  rect(ctx, BLACK, width - 8, 0, 1, height);
  rect(ctx, BLACK, mat.x - 2, mat.y - 2, mat.width + 4, mat.height + 2);
  rect(ctx, "#00a800", mat.x - 1, mat.y - 1, mat.width + 2, 2);
}

function paintCeilingPipe(ctx: Ctx, x: number, bottom: number) {
  const shades = ["#b8f818", "#58d854", "#00a800", "#00a800", "#006800"];
  rect(ctx, BLACK, x, 0, 16, bottom - 6);
  shades.forEach((color, index) => rect(ctx, color, x + 1 + index * 3, 0, 3, bottom - 6));
  rect(ctx, BLACK, x - 2, bottom - 7, 20, 8);
  shades.forEach((color, index) => rect(ctx, color, x - 1 + index * 4, bottom - 6, 4, 6));
}
