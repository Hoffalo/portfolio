import "@testing-library/jest-dom/vitest";

// jsdom has no matchMedia; tests run as a light-scheme, full-motion browser.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }) as unknown as MediaQueryList;
}
