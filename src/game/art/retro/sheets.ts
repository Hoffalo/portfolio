import type { SpriteSheet } from "../sprites";
import type { KingdomSheets } from "../fantasy/sheets";
import { KINGDOM_TILES } from "../fantasy/sheets";
import { CREATURES } from "./sprites/creatures";
import creaturesUrl from "./sprites/creatures.png";
import { INTERIOR } from "./sprites/interior";
import interiorUrl from "./sprites/interior.png";
import { SECRET } from "./sprites/secret";
import secretUrl from "./sprites/secret.png";
import { TOWN } from "./sprites/town";
import townUrl from "./sprites/town.png";

/**
 * The secret world's sheets. Town, creature and room sprites are the kingdom's own, snapped to the
 * NES palette (so the kingdom's painters draw them unchanged); `SECRET_SHEET` holds the bricks,
 * pipes, blocks, coins and hills that only exist here. Sources live in art/retro.
 */
export const RETRO_SHEETS: KingdomSheets = {
  town: { url: townUrl, frames: TOWN },
  tiles: KINGDOM_TILES,
  creatures: { url: creaturesUrl, frames: CREATURES },
  interior: { url: interiorUrl, frames: INTERIOR },
};

export const SECRET_SHEET: SpriteSheet = { url: secretUrl, frames: SECRET };
