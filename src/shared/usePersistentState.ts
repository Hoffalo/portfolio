import { useEffect, useState } from "react";

/** useState that survives reloads. Storage can be unavailable (private mode), so failures fall back to memory. */
export function usePersistentState<T extends string>(
  key: string,
  fallback: () => T,
  isValid: (value: string) => value is T,
) {
  const [value, setValue] = useState<T>(() => {
    const stored = readStorage(key);
    return stored !== null && isValid(stored) ? stored : fallback();
  });

  useEffect(() => writeStorage(key, value), [key, value]);

  return [value, setValue] as const;
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The preference simply won't persist; the app keeps working.
  }
}
