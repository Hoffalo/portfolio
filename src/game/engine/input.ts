import type { Vec } from "./geometry";

export type Direction = "up" | "down" | "left" | "right";

const KEY_DIRECTIONS: Record<string, Direction> = {
  w: "up",
  arrowup: "up",
  s: "down",
  arrowdown: "down",
  a: "left",
  arrowleft: "left",
  d: "right",
  arrowright: "right",
};

export const INTERACT_KEYS = new Set(["e", "enter", " "]);

export function directionForKey(key: string): Direction | undefined {
  return KEY_DIRECTIONS[key.toLowerCase()];
}

/** Held directions from any source (keyboard, touch pad). Opposing directions cancel out. */
export class DirectionInput {
  private readonly held = new Set<Direction>();

  press(direction: Direction) {
    this.held.add(direction);
  }

  release(direction: Direction) {
    this.held.delete(direction);
  }

  clear() {
    this.held.clear();
  }

  vector(): Vec {
    const axis = (negative: Direction, positive: Direction) =>
      Number(this.held.has(positive)) - Number(this.held.has(negative));
    return { x: axis("left", "right"), y: axis("up", "down") };
  }
}
