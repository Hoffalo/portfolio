import { useEffect, useRef } from "react";

/**
 * The latest value, readable from long-lived listeners and loops without re-subscribing them on
 * every render (which would drop held keys, typed code progress or the game loop's state).
 */
export function useLatest<T>(value: T) {
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  });
  return latest;
}
