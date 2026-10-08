import type { ArtStyle } from "../../theme/theme";
import { cyberpunkArt } from "./cyberpunk";
import { fantasyArt } from "./fantasy";
import { retroArt } from "./retro";
import type { ThemeArt } from "./types";

export const ART_BY_STYLE: Record<ArtStyle, ThemeArt> = {
  cyberpunk: cyberpunkArt,
  fantasy: fantasyArt,
  retro: retroArt,
};
