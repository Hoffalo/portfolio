import type { ReactNode } from "react";

/** "dialog" is the Pokémon-style text box; "theater" is the larger, centred box that holds video. */
export type PopupVariant = "dialog" | "theater";

export interface PopupEntry {
  title: string;
  variant: PopupVariant;
  content: ReactNode;
}

/**
 * Popups form a stack so one can open from inside another: a collection's video covers the
 * collection, and closing the video uncovers the collection exactly as it was left.
 */
export type PopupStack = readonly PopupEntry[];

export type PopupChange = { type: "open"; entry: PopupEntry } | { type: "close" };

export function applyPopupChange(stack: PopupStack, change: PopupChange): PopupStack {
  switch (change.type) {
    case "open":
      return [...stack, change.entry];
    case "close":
      return stack.slice(0, -1);
  }
}
