import { useEffect, useState } from "react";

export type AsyncState<T> =
  { status: "loading" } | { status: "error"; error: unknown } | { status: "ready"; data: T };

/** Runs `load` once per change of `key` and ignores results that arrive after unmount or a newer request. */
export function useAsync<T>(key: string, load: () => Promise<T>): AsyncState<T> {
  const [state, setState] = useState<{ key: string; value: AsyncState<T> }>({
    key,
    value: { status: "loading" },
  });

  useEffect(() => {
    let current = true;
    load().then(
      (data) => current && setState({ key, value: { status: "ready", data } }),
      (error: unknown) => current && setState({ key, value: { status: "error", error } }),
    );
    return () => {
      current = false;
    };
    // `load` is intentionally keyed by `key` so callers can pass inline functions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state.key === key ? state.value : { status: "loading" };
}
