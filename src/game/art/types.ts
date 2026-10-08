import type { Rect, Vec } from "../engine/geometry";
import type { SocialLink } from "../../content/types";
import type { BuildingKind, FurnitureKind } from "../../sections/types";
import type { Actor } from "../world/actors";
import type { FurnitureDetails, Prop, World } from "../world/world";
import type { Player } from "../engine/physics";
import type { Ctx } from "./pixel";

/** Everything a painter needs for one frame. The context is already translated into world space. */
export interface Frame {
  ctx: Ctx;
  world: World;
  /** The visible part of the world. */
  view: Rect;
  /** Seconds. Frozen when the visitor prefers reduced motion, which stills every animation. */
  time: number;
  /** Where the player stands, so scenery can react to them (a pet waking, a piano playing). */
  focus: Vec;
}

/** A visual style for the whole world. Swapping the implementation re-skins every scene. */
export interface ThemeArt {
  /** Terrain, paths, walls and floors: everything beneath the objects. */
  ground(frame: Frame): void;
  building(frame: Frame, kind: BuildingKind, bounds: Rect, door: Rect): void;
  sign(frame: Frame, brand: SocialLink["id"], bounds: Rect): void;
  prop(frame: Frame, prop: Prop): void;
  /** A wandering creature; the theme decides which animal (or robot) each role is. */
  actor(frame: Frame, actor: Actor): void;
  furniture(
    frame: Frame,
    kind: FurnitureKind,
    bounds: Rect,
    details: FurnitureDetails,
    image?: HTMLImageElement,
  ): void;
  /** A switch on the wall that turns the carousel of wall pieces; it lights up when pressed. */
  wallSwitch(frame: Frame, direction: -1 | 1, bounds: Rect): void;
  /** The player, dressed for the theme. */
  character(frame: Frame, player: Player): void;
  /** Drawn over everything else, e.g. rain and lamplight. */
  foreground(frame: Frame): void;
}
