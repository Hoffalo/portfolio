import { useMemo, useReducer, type ReactNode } from "react";
import { useLocale } from "../../i18n/LocaleContext";
import { Popup } from "./Popup";
import { PopupContext, type PopupContextValue } from "./PopupContext";
import { applyPopupChange } from "./popupStack";

/**
 * Owns the popup stack for everything inside it. Only the top popup is visible, but the ones
 * beneath stay mounted so a collection keeps its scroll position while one of its videos plays.
 */
export function PopupProvider({ children }: { children: ReactNode }) {
  const { ui } = useLocale();
  const [stack, dispatch] = useReducer(applyPopupChange, []);

  const value = useMemo<PopupContextValue>(
    () => ({
      isOpen: stack.length > 0,
      open: (entry) => dispatch({ type: "open", entry }),
      close: () => dispatch({ type: "close" }),
    }),
    [stack.length],
  );

  return (
    <PopupContext.Provider value={value}>
      {children}
      {stack.map((entry, depth) => (
        <Popup
          key={depth}
          title={entry.title}
          variant={entry.variant}
          hidden={depth < stack.length - 1}
          closeLabel={depth > 0 ? ui.back : ui.close}
          onClose={value.close}
        >
          {entry.content}
        </Popup>
      ))}
    </PopupContext.Provider>
  );
}
