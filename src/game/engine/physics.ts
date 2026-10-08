import type { Rect, Vec } from "./geometry";

export type Facing = "up" | "down" | "left" | "right";

/** The player's position is their feet; the sprite is drawn above it. */
export interface Player extends Vec {
  facing: Facing;
  moving: boolean;
}

/** Art pixels per second. */
export const WALK_SPEED = 76;
// Long frames (tab switches, slow devices) would otherwise tunnel the player through walls.
const MAX_STEP_SECONDS = 0.05;
const SUB_STEP = 1;

/** Only the feet collide, so the player can walk "behind" the tops of trees and furniture. */
export const feetBox = ({ x, y }: Vec): Rect => ({ x: x - 4, y: y - 3, width: 8, height: 4 });

export function facingFor(direction: Vec, previous: Facing): Facing {
  if (direction.x !== 0) return direction.x < 0 ? "left" : "right";
  if (direction.y !== 0) return direction.y < 0 ? "up" : "down";
  return previous;
}

/**
 * Moves the player with axis-separated collision: when one axis is blocked the other still slides,
 * which keeps movement smooth along walls and around corners.
 */
export function stepPlayer(
  player: Player,
  direction: Vec,
  seconds: number,
  isBlocked: (feet: Rect) => boolean,
): Player {
  const length = Math.hypot(direction.x, direction.y);
  const facing = facingFor(direction, player.facing);
  if (length === 0) return { ...player, facing, moving: false };

  const distance = WALK_SPEED * Math.min(seconds, MAX_STEP_SECONDS);
  const steps = Math.max(1, Math.ceil(distance / SUB_STEP));
  const dx = (direction.x / length) * (distance / steps);
  const dy = (direction.y / length) * (distance / steps);

  let { x, y } = player;
  for (let step = 0; step < steps; step++) {
    if (!isBlocked(feetBox({ x: x + dx, y }))) x += dx;
    if (!isBlocked(feetBox({ x, y: y + dy }))) y += dy;
  }
  return { x, y, facing, moving: x !== player.x || y !== player.y };
}
