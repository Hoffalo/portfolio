import type { Actor } from "../../world/actors";
import { blink, disc, rect, type Ctx } from "../pixel";
import { drawSprite } from "../sprites";
import type { Frame } from "../types";
import { NEON } from "./palette";
import { CITY_CREATURES } from "./sheets";

/** Picks a sprite frame for the creature's current activity; the sheet holds right-facing frames. */
type Pose = (actor: Actor, time: number) => { id: string; lift?: number };

const walking = (actor: Actor, time: number) => Math.floor(time * 8 + actor.phase) % 2;

const poses: Record<Actor["role"], Pose> = {
  // Botzo, the IE Robotics Lab robot dog.
  companion: (actor, time) => ({ id: actor.moving ? `dog-${1 + walking(actor, time)}` : "dog-0" }),
  // A black alley cat that pounces between rooftops.
  hopper: (actor, time) => {
    const lift = actor.moving ? walking(actor, time) * 2 : 0;
    return { id: lift ? "cat-1" : "cat-0", lift };
  },
  // Pigeons bob and peck while idle.
  flock: (actor, time) => ({
    id: actor.moving
      ? `pigeon-${walking(actor, time)}`
      : Math.sin(time * 5 + actor.phase * 3) > 0.6
        ? "pigeon-2"
        : "pigeon-0",
  }),
  // A tracked maintenance bot.
  grazer: (actor, time) => ({ id: `bot-${actor.moving ? walking(actor, time) : 0}` }),
  // A cleaning roomba.
  roller: () => ({ id: "roomba-0" }),
};

function groundShadow(ctx: Ctx, x: number, y: number, width: number) {
  ctx.save();
  ctx.globalAlpha = 0.35;
  disc(ctx, "#000", x, y, width / 2, 2);
  ctx.restore();
}

const SHADOW_WIDTH: Record<Actor["role"], number> = {
  companion: 14,
  hopper: 10,
  flock: 6,
  grazer: 16,
  roller: 12,
};

export function paintCityActor({ ctx, time }: Frame, actor: Actor) {
  const x = Math.round(actor.x);
  const y = Math.round(actor.y);
  const { id, lift = 0 } = poses[actor.role](actor, time);
  const flip = actor.facing === "left";
  groundShadow(ctx, x, y, SHADOW_WIDTH[actor.role] - lift);
  drawSprite(ctx, CITY_CREATURES, id, x, y - lift + 1, flip);

  // Status lights blink in code so every bot keeps its own rhythm.
  const ahead = (offset: number) => (flip ? x - offset - 1 : x + offset);
  if (actor.role === "companion" && blink(time, 1.4, actor.phase))
    rect(ctx, NEON.red, ahead(8), y - 11, 1, 1);
  if (actor.role === "grazer" && blink(time, 0.5, actor.phase))
    rect(ctx, NEON.red, ahead(-4), y - 17, 1, 1);
  if (actor.role === "roller")
    rect(ctx, Math.sin(time * 4 + actor.phase) > 0 ? NEON.cyan : NEON.cyanDim, x - 1, y - 4, 2, 1);
}
