import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useTheme } from "./ThemeContext";
import { ThemeProvider } from "./ThemeProvider";
import { KONAMI_CODE } from "./theme";

function Probe() {
  const { artStyle, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      {artStyle}
    </button>
  );
}

const type = (keys: readonly string[]) => {
  for (const key of keys)
    fireEvent.keyDown(window, { key: key.length > 1 ? key.replace("arrow", "Arrow") : key });
};

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("theme", "fantasy");
});

describe("Konami code", () => {
  it("opens the secret world and closes it when entered again", () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    type(KONAMI_CODE);
    expect(screen.getByRole("button").textContent).toBe("retro");
    expect(document.documentElement.dataset.theme).toBe("retro");
    type(KONAMI_CODE);
    expect(screen.getByRole("button").textContent).toBe("fantasy");
  });

  it("needs the whole sequence in order, but tolerates an extra ↑ at the start", () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    type(["ArrowUp", "ArrowUp", "ArrowDown", "x", ...KONAMI_CODE.slice(3)]);
    expect(screen.getByRole("button").textContent).toBe("fantasy");
    type(["ArrowUp", ...KONAMI_CODE]);
    expect(screen.getByRole("button").textContent).toBe("retro");
  });

  it("leaves the secret world when the theme is switched", () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    type(KONAMI_CODE);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button").textContent).toBe("cyberpunk");
  });
});
