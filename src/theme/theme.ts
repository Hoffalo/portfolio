/** Dark mode is the cyberpunk city; light mode is the fantasy kingdom. */
export const THEMES = ["cyberpunk", "fantasy"] as const;
export type Theme = (typeof THEMES)[number];

export function isTheme(value: string): value is Theme {
  return (THEMES as readonly string[]).includes(value);
}

export function detectTheme(): Theme {
  return matchMedia("(prefers-color-scheme: light)").matches ? "fantasy" : "cyberpunk";
}

export const BROWSER_THEME_COLOR: Record<Theme, string> = {
  cyberpunk: "#0b0420",
  fantasy: "#cfe6f7",
};

/** What the world is drawn in: the current theme, or the retro style while the secret is active. */
export type ArtStyle = Theme | "retro";

/** ↑ ↑ ↓ ↓ ← → ← → B A */
export const KONAMI_CODE = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
] as const;
