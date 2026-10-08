import { containsPoint, intersects, type Rect, type Vec } from "../engine/geometry";
import type { Facing } from "../engine/physics";
import type { SocialLink } from "../../content/types";
import type { BuildingKind, FurnitureKind, Motif } from "../../sections/types";

export type FixtureVisual =
  | { type: "building"; kind: BuildingKind; door: Rect }
  | { type: "sign"; brand: SocialLink["id"] }
  | { type: "furniture"; kind: FurnitureKind; details: FurnitureDetails }
  /** A wall switch that turns the carousel of wall pieces one step left (-1) or right (1). */
  | { type: "switch"; direction: -1 | 1 };

/** What makes one piece of furniture different from another of the same kind. */
export interface FurnitureDetails {
  image?: string;
  accent?: string;
  lit?: boolean;
  levels?: readonly number[];
  motif?: Motif;
}

export type FixtureAction =
  | { type: "enterSection"; sectionId: string }
  | { type: "openLink"; url: string }
  | { type: "exitRoom" }
  | { type: "inspect"; exhibitId: string }
  | { type: "rotate"; step: -1 | 1 };

/** Something the player can use: a building door, a sign, a piece of furniture. */
export interface Fixture {
  id: string;
  /** What is drawn, and where its clickable hotspot sits. */
  bounds: Rect;
  /** Standing here (feet inside) makes the fixture usable. */
  zone: Rect;
  visual: FixtureVisual;
  action: FixtureAction;
}

/** Walking into a portal while facing its direction triggers its action, like a door in Pokémon. */
export interface Portal {
  zone: Rect;
  facing: Facing;
  action: FixtureAction;
}

/**
 * Scenery kinds. Names describe the role in the layout; each theme decides the look
 * (a "barn" is a stable in the kingdom and a garage in the city; a "vehicle" is a carriage or a hover car).
 */
export type PropKind =
  | "tree"
  | "bush"
  | "lamp"
  | "bench"
  | "flowers"
  | "fountain"
  | "plant"
  | "campfire"
  | "fence"
  | "barrel"
  | "crate"
  | "rock"
  | "mushrooms"
  | "stall"
  | "barn"
  | "vehicle"
  | "cart"
  | "trough"
  /** A sleeping house pet that wakes up when the visitor comes close. */
  | "pet";

/** Scenery: drawn and solid, but not interactive. */
export interface Prop {
  kind: PropKind;
  bounds: Rect;
  /** Varies otherwise identical props (tree shape, flower colours). */
  seed: number;
}

/** A straight stretch of footpath; diagonals are allowed so paths can fan out from the fountain. */
export interface PathSegment {
  from: Vec;
  to: Vec;
  width: number;
}

export interface TownGround {
  type: "town";
  /** Sky and distant scenery above the treeline; never walkable. */
  horizon: number;
  /** A river (or canal) running across the town just below the treeline. */
  river: Rect;
  /** Where the river can be crossed. */
  bridge: Rect;
  paths: PathSegment[];
  plaza: Rect;
  /** The fenced farm (or garage lot) at the south end, and the pen inside it. */
  yard: Rect;
  pen: Rect;
}

export interface RoomGround {
  type: "room";
  wallHeight: number;
  windows: Rect[];
  mat: Rect;
  rug: Rect;
}

export type Ground = TownGround | RoomGround;

/**
 * The roles wandering creatures play. Like props, each theme picks the creature:
 * a "companion" is a fox or a robot dog, a "flock" is chickens or pigeons.
 */
export type ActorRole = "companion" | "hopper" | "flock" | "grazer" | "roller";

/** Where and how many creatures of a role roam. */
export interface ActorSpawn {
  role: ActorRole;
  area: Rect;
  count: number;
}

export interface World {
  kind: "town" | "room";
  width: number;
  height: number;
  ground: Ground;
  fixtures: Fixture[];
  props: Prop[];
  portals: Portal[];
  obstacles: Rect[];
  actors: ActorSpawn[];
  spawn: Vec & { facing: Facing };
  /** A wall too crowded to show at once; its pieces slide along `strip` whenever `offset` changes. */
  carousel?: Carousel;
}

export interface Carousel {
  /** Which piece the carousel starts at; not wrapped, so its sign says which way it last turned. */
  offset: number;
  /** The stretch of wall between the switches; sliding pieces are cut off at its edges. */
  strip: Rect;
  /** How far one turn moves each piece. */
  pitch: number;
  /** The fixtures currently showing on the carousel. */
  ids: readonly string[];
  /** The pieces just beyond each end, drawn only while they slide in. */
  neighbours: readonly { visual: FixtureVisual; bounds: Rect }[];
}

export function isBlockedIn(world: World) {
  return (feet: Rect) =>
    feet.x < 0 ||
    feet.y < 0 ||
    feet.x + feet.width > world.width ||
    feet.y + feet.height > world.height ||
    world.obstacles.some((obstacle) => intersects(feet, obstacle));
}

export function findUsableFixture(world: World, feet: Vec): Fixture | undefined {
  return world.fixtures.find((fixture) => containsPoint(fixture.zone, feet));
}

export function findTriggeredPortal(world: World, feet: Vec, facing: Facing, moving: boolean) {
  if (!moving) return undefined;
  return world.portals.find(
    (portal) => portal.facing === facing && containsPoint(portal.zone, feet),
  );
}

/** Most objects only block at their base, leaving the top as depth the player can walk behind. */
export const baseOf = (rect: Rect, depth: number): Rect => ({
  x: rect.x,
  y: rect.y + rect.height - depth,
  width: rect.width,
  height: depth,
});
