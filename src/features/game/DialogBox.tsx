import { useEffect, useRef, type ReactNode } from "react";
import { useLocale } from "../../i18n/LocaleContext";

interface DialogBoxProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** A Pokémon-style text box along the bottom of the screen, holding the exhibit's content. */
export function DialogBox({ title, onClose, children }: DialogBoxProps) {
  const { ui } = useLocale();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const returnFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => returnFocus?.focus();
  }, []);

  return (
    <div
      className="dialog-box"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onKeyDown={(event) => {
        // E closes too, mirroring how it opened the box.
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
          {ui.close} <kbd>E</kbd>
        </button>
      </header>
      <div className="dialog-box__body">{children}</div>
      <span className="dialog-box__cursor" aria-hidden="true">
        ▼
      </span>
    </div>
  );
}
