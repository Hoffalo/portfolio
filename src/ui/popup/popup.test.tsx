import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { LocaleProvider } from "../../i18n/LocaleProvider";
import { usePopups } from "./PopupContext";
import { PopupProvider } from "./PopupProvider";
import { applyPopupChange, type PopupEntry } from "./popupStack";

const entry = (title: string): PopupEntry => ({ title, variant: "dialog", content: title });

describe("applyPopupChange", () => {
  it("puts an opened popup on top of the stack", () => {
    const stack = [entry("collection")];

    const next = applyPopupChange(stack, { type: "open", entry: entry("video") });

    expect(next.map((popup) => popup.title)).toEqual(["collection", "video"]);
  });

  it("closes only the popup on top", () => {
    const stack = [entry("collection"), entry("video")];

    const next = applyPopupChange(stack, { type: "close" });

    expect(next.map((popup) => popup.title)).toEqual(["collection"]);
  });

  it("does nothing when closing with no popup open", () => {
    const next = applyPopupChange([], { type: "close" });

    expect(next).toEqual([]);
  });
});

function OpensAVideo() {
  const { open } = usePopups();
  return (
    <button type="button" onClick={() => open(entry("Teaser"))}>
      play
    </button>
  );
}

function OpensACollection() {
  const { open } = usePopups();
  return (
    <button
      type="button"
      onClick={() => open({ title: "BRASA", variant: "theater", content: <OpensAVideo /> })}
    >
      browse
    </button>
  );
}

function renderPopups() {
  render(
    <LocaleProvider>
      <PopupProvider>
        <OpensACollection />
      </PopupProvider>
    </LocaleProvider>,
  );
}

describe("PopupProvider", () => {
  beforeEach(() => localStorage.setItem("locale", "en"));

  it("replaces a collection with the video opened from it", () => {
    renderPopups();

    fireEvent.click(screen.getByRole("button", { name: "browse" }));
    fireEvent.click(screen.getByRole("button", { name: "play" }));

    expect(screen.getByRole("dialog", { name: "Teaser" })).toBeVisible();
    expect(screen.queryByRole("dialog", { name: "BRASA" })).not.toBeInTheDocument();
  });

  it("brings the collection back when its video is closed", () => {
    renderPopups();
    fireEvent.click(screen.getByRole("button", { name: "browse" }));
    fireEvent.click(screen.getByRole("button", { name: "play" }));

    fireEvent.click(screen.getByRole("button", { name: /Back/ }));

    expect(screen.getByRole("dialog", { name: "BRASA" })).toBeVisible();
    expect(screen.queryByRole("dialog", { name: "Teaser" })).not.toBeInTheDocument();
  });

  it("closes from the keyboard with Escape", () => {
    renderPopups();
    fireEvent.click(screen.getByRole("button", { name: "browse" }));

    fireEvent.keyDown(screen.getByRole("dialog", { name: "BRASA" }), { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
