/** Calls `frame` every animation frame with elapsed seconds since the previous frame. Returns a stop function. */
export function startLoop(frame: (seconds: number, time: number) => void): () => void {
  let handle = 0;
  let previous = performance.now();

  const tick = (now: number) => {
    frame((now - previous) / 1000, now / 1000);
    previous = now;
    handle = requestAnimationFrame(tick);
  };

  handle = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(handle);
}
