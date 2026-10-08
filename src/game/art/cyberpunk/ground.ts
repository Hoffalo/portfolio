import type { Frame } from "../types";
import { paintInterior } from "./interior";
import { CITY } from "./palette";
import { rect } from "../pixel";
import { paintCityTown } from "./town";

export function paintCityGround(frame: Frame) {
  const { ctx, world, view } = frame;
  rect(ctx, CITY.void, view.x, view.y, view.width, view.height);
  if (world.ground.type === "town") paintCityTown(frame, world.ground);
  else paintInterior(frame, world.ground);
}
