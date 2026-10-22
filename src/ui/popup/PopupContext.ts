import { createContext, useContext } from "react";
import type { PopupEntry } from "./popupStack";

export interface PopupContextValue {
  isOpen: boolean;
  open: (entry: PopupEntry) => void;
  /** Closes the popup on top, revealing the one beneath it, if any. */
  close: () => void;
}

export const PopupContext = createContext<PopupContextValue | null>(null);

export function usePopups() {
  const value = useContext(PopupContext);
  if (!value) throw new Error("usePopups must be used inside <PopupProvider>");
  return value;
}
