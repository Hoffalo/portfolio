import type { SpriteSheet } from "../sprites";
import { INTERIOR } from "./sprites/interior";
import interiorUrl from "./sprites/interior.png";
import { CREATURES } from "./sprites/creatures";
import creaturesUrl from "./sprites/creatures.png";
import { TILES } from "./sprites/tiles";
import tilesUrl from "./sprites/tiles.png";
import { TOWN } from "./sprites/town";
import townUrl from "./sprites/town.png";

/**
 * The city's sprite sheets. Each PNG is exported from the .aseprite file of the same name in
 * art/cyberpunk; the frame tables beside them record where every sprite sits on its sheet.
 */
/** Buildings, street furniture and billboards. */
export const CITY_SHEET: SpriteSheet = { url: townUrl, frames: TOWN };
/** Seamless textures (asphalt, plates, hex tiles, walls, floors) plus the bridge and windows. */
export const CITY_TILES: SpriteSheet = { url: tilesUrl, frames: TILES };
/** The runner and the city's critters and bots, with their walk cycles. */
export const CITY_CREATURES: SpriteSheet = { url: creaturesUrl, frames: CREATURES };
/** Room furniture: LED frames, workstations, racks, the LED wall and the robot cat. */
export const CITY_INTERIOR: SpriteSheet = { url: interiorUrl, frames: INTERIOR };
