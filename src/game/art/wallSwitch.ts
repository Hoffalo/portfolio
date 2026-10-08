import type { Rect } from "../engine/geometry";
import { rect, type Ctx } from "./pixel";

/** Colours for one theme's carousel switch. */
export interface SwitchStyle {
  frame: string;
  face: string;
  arrow: string;
  /** The arrow's colour while the visitor stands at the switch. */
  lit: string;
  highlight: string;
}

/**
 * A square plate with a chunky arrow pointing the way the carousel will turn. Every theme draws
 * the same shape in its own colours, so the switches always read as controls.
 */
export function paintSwitch(
  ctx: Ctx,
  b: Rect,
  direction: -1 | 1,
  style: SwitchStyle,
  near: boolean,
) {
  rect(ctx, style.frame, b.x, b.y, b.width, b.height);
  rect(ctx, style.face, b.x + 1, b.y + 1, b.width - 2, b.height - 2);
  rect(ctx, style.highlight, b.x + 1, b.y + 1, b.width - 2, 1);
  const color = near ? style.lit : style.arrow;
  const cx = b.x + b.width / 2;
  const cy = b.y + b.height / 2;
  // A triangle head and a short shaft.
  for (let column = 0; column < 4; column++) {
    const x = direction > 0 ? cx + 1 - column : cx - 2 + column;
    rect(ctx, color, x, cy - column, 1, column * 2 + 1);
  }
  rect(ctx, color, direction > 0 ? cx - 4 : cx + 1, cy - 1, 4, 3);
}
