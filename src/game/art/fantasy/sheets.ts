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
 * The kingdom's sprite sheets. Each PNG is exported from the .aseprite file of the same name in
 * art/fantasy; the frame tables beside them record where every sprite sits on its sheet.
 */
export const KINGDOM_SHEET: SpriteSheet = { url: townUrl, frames: TOWN };
/** Seamless textures (grass, dirt, cobbles, walls, floors) plus the bridge, windows and torches. */
export const KINGDOM_TILES: SpriteSheet = { url: tilesUrl, frames: TILES };
/** The hooded adventurer and the village animals, with their walk cycles. */
export const KINGDOM_CREATURES: SpriteSheet = { url: creaturesUrl, frames: CREATURES };
/** Room furniture: picture frames, desks, cabinets, the tapestry and the house cat. */
export const KINGDOM_INTERIOR: SpriteSheet = { url: interiorUrl, frames: INTERIOR };

/** Every sheet the kingdom's painters draw from; the secret world swaps in recoloured copies. */
export interface KingdomSheets {
  town: SpriteSheet;
  tiles: SpriteSheet;
  creatures: SpriteSheet;
  interior: SpriteSheet;
}

export const KINGDOM_SHEETS: KingdomSheets = {
  town: KINGDOM_SHEET,
  tiles: KINGDOM_TILES,
  creatures: KINGDOM_CREATURES,
  interior: KINGDOM_INTERIOR,
};
