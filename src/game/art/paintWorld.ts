import { bottom, intersects, expand, type Rect } from "../engine/geometry";
import type { Player } from "../engine/physics";
import type { Actor } from "../world/actors";
import type { World } from "../world/world";
import { loadedImage } from "./images";
import type { Frame, ThemeArt } from "./types";

interface Drawable {
  depth: number;
  bounds: Rect;
  paint: () => void;
}

/**
 * Draws one frame: ground first, then every object sorted by how far down the screen its base is,
 * so the player correctly passes in front of and behind things.
 */
export function paintWorld(
  scene: Omit<Frame, "focus">,
  art: ThemeArt,
  player: Player,
  actors: readonly Actor[],
) {
  const frame: Frame = { ...scene, focus: { x: player.x, y: player.y } };
  const { ctx, world } = frame;
  ctx.save();
  ctx.translate(-frame.view.x, -frame.view.y);

  art.ground(frame);

  const drawables: Drawable[] = [
    ...world.props.map((prop) => ({
      depth: bottom(prop.bounds),
      bounds: prop.bounds,
      paint: () => art.prop(frame, prop),
    })),
    ...world.fixtures.map((fixture) => ({
      depth: bottom(fixture.bounds),
      bounds: fixture.bounds,
      paint: () => paintFixture(frame, art, fixture.visual, fixture.bounds),
    })),
    ...actors.map((actor) => ({
      depth: actor.y,
      bounds: { x: actor.x - 10, y: actor.y - 18, width: 20, height: 20 },
      paint: () => art.actor(frame, actor),
    })),
    {
      depth: player.y,
      bounds: { x: player.x - 8, y: player.y - 26, width: 16, height: 28 },
      paint: () => art.character(frame, player),
    },
  ];

  const visible = expand(frame.view, 24);
  drawables
    .filter((drawable) => intersects(drawable.bounds, visible))
    .sort((a, b) => a.depth - b.depth)
    .forEach((drawable) => drawable.paint());

  art.foreground(frame);
  ctx.restore();
}

function paintFixture(
  frame: Frame,
  art: ThemeArt,
  visual: World["fixtures"][number]["visual"],
  bounds: Rect,
) {
  switch (visual.type) {
    case "building":
      return art.building(frame, visual.kind, bounds, visual.door);
    case "sign":
      return art.sign(frame, visual.brand, bounds);
    case "switch":
      return art.wallSwitch(frame, visual.direction, bounds);
    case "furniture":
      return art.furniture(
        frame,
        visual.kind,
        bounds,
        visual.details,
        visual.details.image ? loadedImage(visual.details.image) : undefined,
      );
  }
}
