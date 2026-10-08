import { useEffect, useRef } from "react";
import { directionForKey, INTERACT_KEYS, type DirectionInput } from "../../game/engine/input";

interface KeyboardOptions {
  input: DirectionInput;
  enabled: boolean;
  onInteract: () => void;
}

/** Typing in a form field or using a focused control must never move the character. */
function isEditable(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
  );
}

/** Enter and Space already activate a focused button; handling them too would trigger it twice. */
function isNativelyActivated(event: KeyboardEvent) {
  return (
    event.key !== "e" &&
    event.key !== "E" &&
    event.target instanceof HTMLElement &&
    event.target.closest("button, a")
  );
}

export function useKeyboardControls({ input, enabled, onInteract }: KeyboardOptions) {
  const interact = useRef(onInteract);
  useEffect(() => {
    interact.current = onInteract;
  });

  useEffect(() => {
    if (!enabled) {
      input.clear();
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      // Keys something else already handled (e.g. E closing a dialog) must not also act in the game.
      if (event.defaultPrevented) return;
      if (event.ctrlKey || event.metaKey || event.altKey || isEditable(event.target)) return;
      const direction = directionForKey(event.key);
      if (direction) {
        event.preventDefault();
        input.press(direction);
      } else if (
        INTERACT_KEYS.has(event.key.toLowerCase()) &&
        !event.repeat &&
        !isNativelyActivated(event)
      ) {
        event.preventDefault();
        interact.current();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const direction = directionForKey(event.key);
      if (direction) input.release(direction);
    };
    const releaseAll = () => input.clear();

    addEventListener("keydown", onKeyDown);
    addEventListener("keyup", onKeyUp);
    addEventListener("blur", releaseAll);
    return () => {
      removeEventListener("keydown", onKeyDown);
      removeEventListener("keyup", onKeyUp);
      removeEventListener("blur", releaseAll);
      input.clear();
    };
  }, [input, enabled]);
}
