import type { Rect } from "../engine/geometry";
import type { FurnitureKind } from "../../sections/types";
import { baseOf, type Prop, type PropKind } from "./world";

interface Footprint {
  width: number;
  height: number;
}

/** Where a piece goes: hung on the back wall, in the rows on the floor, or by the entrance. */
export type Placement = "wall" | "floor" | "entrance";

export const FURNITURE: Record<FurnitureKind, Footprint & { placement: Placement }> = {
  "painting-wide": { width: 38, height: 26, placement: "wall" },
  "painting-tall": { width: 22, height: 32, placement: "wall" },
  screen: { width: 58, height: 28, placement: "wall" },
  poster: { width: 24, height: 30, placement: "wall" },
  portrait: { width: 24, height: 28, placement: "wall" },
  desk: { width: 32, height: 22, placement: "floor" },
  rack: { width: 20, height: 32, placement: "floor" },
  bookshelf: { width: 34, height: 32, placement: "floor" },
  globe: { width: 16, height: 22, placement: "floor" },
  piano: { width: 36, height: 24, placement: "floor" },
  console: { width: 22, height: 20, placement: "floor" },
  contributions: { width: 110, height: 44, placement: "entrance" },
};

/** Default sizes; fences take their length from the layout instead. */
export const PROP_SIZE: Record<PropKind, Footprint> = {
  tree: { width: 22, height: 30 },
  bush: { width: 12, height: 10 },
  lamp: { width: 6, height: 24 },
  bench: { width: 20, height: 10 },
  flowers: { width: 14, height: 6 },
  fountain: { width: 48, height: 44 },
  plant: { width: 12, height: 18 },
  campfire: { width: 18, height: 14 },
  fence: { width: 4, height: 4 },
  barrel: { width: 8, height: 10 },
  crate: { width: 10, height: 10 },
  rock: { width: 10, height: 7 },
  mushrooms: { width: 8, height: 6 },
  stall: { width: 36, height: 30 },
  barn: { width: 84, height: 60 },
  vehicle: { width: 44, height: 26 },
  cart: { width: 24, height: 16 },
  trough: { width: 20, height: 8 },
  pet: { width: 16, height: 10 },
};

/** The part of a prop that blocks walking. Ground cover is walkable; trees only block at the trunk. */
export function propSolid(prop: Prop): Rect | null {
  const { bounds } = prop;
  switch (prop.kind) {
    case "flowers":
    case "mushrooms":
      return null;
    case "pet":
      return baseOf(bounds, 4);
    case "tree":
      return {
        x: bounds.x + 7,
        y: bounds.y + bounds.height - 5,
        width: bounds.width - 14,
        height: 5,
      };
    case "lamp":
      return baseOf(bounds, 3);
    case "fountain":
      return baseOf(bounds, 26);
    case "fence":
    case "barn":
      return bounds;
    case "vehicle":
      return baseOf(bounds, 14);
    default:
      return baseOf(bounds, Math.ceil(bounds.height / 2));
  }
}

export function placeProp(
  kind: PropKind,
  x: number,
  y: number,
  seed = 0,
  size: Footprint = PROP_SIZE[kind],
): Prop {
  return { kind, seed, bounds: { x: Math.round(x), y: Math.round(y), ...size } };
}
