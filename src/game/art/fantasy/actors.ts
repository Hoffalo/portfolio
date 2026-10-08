import type { Actor } from "../../world/actors";
import { disc, type Ctx } from "../pixel";
import { drawSprite } from "../sprites";
import type { Frame } from "../types";
import type { KingdomSheets } from "./sheets";

/** Picks a sprite frame for the creature's current activity; the sheet holds right-facing frames. */
type Pose = (actor: Actor, time: number) => { id: string; lift?: number };

const walking = (actor: Actor, time: number) => Math.floor(time * 8 + actor.phase) % 2;
const idleBeat = (actor: Actor, time: number, speed: number) =>
  Math.sin(time * speed + actor.phase * 3) > 0.6;

const poses: Record<Actor["role"], Pose> = {
  // A fox that trots around the square and sits down to rest.
  companion: (actor, time) => ({
    id: actor.moving ? `fox-${1 + walking(actor, time)}` : actor.phase % 2 > 1 ? "fox-3" : "fox-0",
  }),
  // A rabbit that hops rather than walks.
  hopper: (actor, time) => {
    const lift = actor.moving ? Math.round(Math.abs(Math.sin(time * 9 + actor.phase)) * 3) : 0;
    return { id: lift > 0 ? "rabbit-1" : "rabbit-0", lift };
  },
  // Chickens peck whenever they stop.
  flock: (actor, time) => ({
    id: actor.moving
      ? `chicken-${walking(actor, time)}`
      : idleBeat(actor, time, 5)
        ? "chicken-2"
        : "chicken-0",
  }),
  // Highland cows lower their heads to graze while idle.
  grazer: (actor, time) => ({
    id: actor.moving
      ? `cow-${1 + walking(actor, time)}`
      : Math.sin(time * 1.2 + actor.phase) > 0
        ? "cow-3"
        : "cow-0",
  }),
  roller: (actor, time) => ({ id: actor.moving ? `pig-${1 + walking(actor, time)}` : "pig-0" }),
};

function groundShadow(ctx: Ctx, x: number, y: number, width: number) {
  ctx.save();
  ctx.globalAlpha = 0.25;
  disc(ctx, "#1d1a10", x, y, width / 2, 2);
  ctx.restore();
}

const SHADOW_WIDTH: Record<Actor["role"], number> = {
  companion: 14,
  hopper: 8,
  flock: 7,
  grazer: 20,
  roller: 13,
};

/** Creature painter drawing from the given sheets. */
export const kingdomActors =
  (sheets: KingdomSheets) =>
  ({ ctx, time }: Frame, actor: Actor) => {
    const x = Math.round(actor.x);
    const y = Math.round(actor.y);
    const { id, lift = 0 } = poses[actor.role](actor, time);
    groundShadow(ctx, x, y, SHADOW_WIDTH[actor.role] - lift);
    drawSprite(ctx, sheets.creatures, id, x, y - lift + 1, actor.facing === "left");
  };
