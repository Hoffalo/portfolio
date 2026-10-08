import type { PointerEvent } from "react";
import type { Direction, DirectionInput } from "../../game/engine/input";
import { useLocale } from "../../i18n/LocaleContext";

const PAD: { direction: Direction; glyph: string }[] = [
  { direction: "up", glyph: "▲" },
  { direction: "left", glyph: "◀" },
  { direction: "right", glyph: "▶" },
  { direction: "down", glyph: "▼" },
];

/** On-screen D-pad for touch devices; hidden by CSS on devices with a fine pointer. */
export function TouchControls({ input }: { input: DirectionInput }) {
  const { ui } = useLocale();

  const hold = (direction: Direction) => (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    input.press(direction);
  };
  const release = (direction: Direction) => () => input.release(direction);

  return (
    <div className="touch-pad" role="group" aria-label={ui.movementControls}>
      {PAD.map(({ direction, glyph }) => (
        <button
          key={direction}
          type="button"
          className={`touch-pad__button touch-pad__button--${direction}`}
          aria-label={ui.move[direction]}
          onPointerDown={hold(direction)}
          onPointerUp={release(direction)}
          onPointerCancel={release(direction)}
          onLostPointerCapture={release(direction)}
          onContextMenu={(event) => event.preventDefault()}
        >
          {glyph}
        </button>
      ))}
    </div>
  );
}
