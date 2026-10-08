import { rect } from "../pixel";
import type { Frame } from "../types";
import { paintHall } from "./interior";
import { KINGDOM } from "./palette";
import { paintKingdomTown } from "./town";

export function paintKingdomGround(frame: Frame) {
  const { ctx, world, view } = frame;
  rect(ctx, KINGDOM.forest, view.x, view.y, view.width, view.height);
  if (world.ground.type === "town") paintKingdomTown(frame, world.ground);
  else paintHall(frame, world.ground);
}
