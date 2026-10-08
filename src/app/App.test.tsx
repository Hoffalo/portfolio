import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "../i18n/LocaleProvider";
import { sections } from "../sections/registry";
import { ThemeProvider } from "../theme/ThemeProvider";
import { App } from "./App";

function renderApp(hash: string) {
  location.hash = hash;
  return render(
    <ThemeProvider>
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </ThemeProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("locale", "en");
  // GitHub is never reached from tests; the dev section simply shows its loading state.
  vi.stubGlobal(
    "fetch",
    vi.fn(() => new Promise(() => {})),
  );
});

describe("App", () => {
  it("lists every registered section in boring mode", () => {
    renderApp("#/read/career");
    const nav = screen.getByRole("navigation", { name: "Sections" });
    for (const section of sections) expect(nav).toHaveTextContent(section.title.en);
    expect(screen.getByRole("heading", { level: 1, name: "Career" })).toBeInTheDocument();
  });

  it("switches language", () => {
    renderApp("#/read/career");
    fireEvent.click(screen.getByRole("button", { name: "Mudar para português" }));
    expect(screen.getByRole("heading", { level: 1, name: "Carreira" })).toBeInTheDocument();
  });

  it("switches theme", () => {
    renderApp("#/read/about");
    const before = document.documentElement.dataset.theme;
    fireEvent.click(screen.getByRole("button", { name: /Switch to/ }));
    expect(document.documentElement.dataset.theme).not.toBe(before);
  });

  it("offers a building for every section in the town", () => {
    renderApp("#/");
    for (const section of sections) {
      expect(
        screen.getByRole("button", { name: `Enter · ${section.title.en}` }),
      ).toBeInTheDocument();
    }
  });

  it("enters a room from its building", async () => {
    renderApp("#/");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Enter · Career" }));
      await new Promise((resolve) => setTimeout(resolve));
    });
    expect(location.hash).toBe("#/room/career");
    expect(screen.getByRole("heading", { level: 1, name: "Career" })).toBeInTheDocument();
  });
});
