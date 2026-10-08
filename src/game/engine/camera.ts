import { clamp } from "./geometry";

/**
 * Start of the visible slice along one axis. Worlds smaller than the view are centred,
 * which yields a negative offset.
 */
export function cameraOffset(focus: number, viewSize: number, worldSize: number): number {
  if (worldSize <= viewSize) return -Math.floor((viewSize - worldSize) / 2);
  return clamp(focus - viewSize / 2, 0, worldSize - viewSize);
}
