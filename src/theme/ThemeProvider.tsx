import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { playSecretJingle } from "../shared/chiptune";
import { usePersistentState } from "../shared/usePersistentState";
import { ThemeContext, type ThemeContextValue } from "./ThemeContext";
import { BROWSER_THEME_COLOR, detectTheme, isTheme, KONAMI_CODE } from "./theme";

const RETRO_BROWSER_COLOR = "#6888fc";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = usePersistentState("theme", detectTheme, isTheme);
  const [secret, setSecret] = useState(false);
  useKonamiCode(() => {
    setSecret((active) => !active);
    playSecretJingle();
  });

  useEffect(() => {
    document.documentElement.dataset.theme = secret ? "retro" : theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", secret ? RETRO_BROWSER_COLOR : BROWSER_THEME_COLOR[theme]);
  }, [theme, secret]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      secret,
      artStyle: secret ? "retro" : theme,
      // Switching theme also leaves the secret world, so the button always does what it says.
      toggleTheme: () => {
        setSecret(false);
        setTheme(theme === "cyberpunk" ? "fantasy" : "cyberpunk");
      },
    }),
    [theme, secret, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Calls `onEnter` whenever the Konami code is typed, anywhere except in a text field. */
function useKonamiCode(onEnter: () => void) {
  // The latest callback is read through a ref so the listener (and the progress) survive re-renders.
  const latest = useRef(onEnter);
  useEffect(() => {
    latest.current = onEnter;
  });
  useEffect(() => {
    let progress = 0;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName ?? ""))
        return;
      const key = event.key.toLowerCase();
      if (key === KONAMI_CODE[progress]) progress++;
      // A wrong key restarts the code, though ↑ may begin it again (and ↑↑↑ still counts as ↑↑).
      else progress = key === KONAMI_CODE[0] ? (progress === 2 ? 2 : 1) : 0;
      if (progress === KONAMI_CODE.length) {
        progress = 0;
        latest.current();
      }
    };
    addEventListener("keydown", onKeyDown);
    return () => removeEventListener("keydown", onKeyDown);
  }, []);
}
