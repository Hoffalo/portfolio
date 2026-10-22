import { useEffect, useRef, type ReactNode } from "react";
import type { PopupVariant } from "./popupStack";

interface PopupProps {
  title: string;
  variant: PopupVariant;
  /** Covered by a popup opened from inside it; kept mounted so it reopens exactly as it was. */
  hidden: boolean;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
}

/** A Pokémon-style box with a nameplate on its top edge, styled by the current theme. */
export function Popup({ title, variant, hidden, closeLabel, onClose, children }: PopupProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const returnFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => returnFocus?.focus();
  }, []);

  return (
    <>
      {variant === "theater" && (
        <div className="popup-backdrop" hidden={hidden} aria-hidden="true" onClick={onClose} />
      )}
      <div
        className={`dialog-box dialog-box--${variant}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        hidden={hidden}
        onKeyDown={(event) => {
          // E closes too, mirroring how the game opened the box.
          if (event.key === "Escape" || event.key.toLowerCase() === "e") {
            // Closing re-enables the game's E key before this event reaches it, which would reopen the box.
            event.preventDefault();
            event.stopPropagation();
            onClose();
          }
        }}
      >
        <header className="dialog-box__header">
          <h2 className="dialog-box__title">{title}</h2>
          <button ref={closeRef} type="button" className="dialog-box__close" onClick={onClose}>
            {closeLabel} <kbd>E</kbd>
          </button>
        </header>
        <div className="dialog-box__body">{children}</div>
        <span className="dialog-box__cursor" aria-hidden="true">
          ▼
        </span>
      </div>
    </>
  );
}
