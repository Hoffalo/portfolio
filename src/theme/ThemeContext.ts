import { createContext, useContext } from "react";
import type { ArtStyle, Theme } from "./theme";

export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  /** True while the Konami-code secret world is active; it lasts until the code is entered again. */
  secret: boolean;
  /** What the game draws: the theme, or "retro" in the secret world. */
  artStyle: ArtStyle;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside <ThemeProvider>");
  return value;
}
