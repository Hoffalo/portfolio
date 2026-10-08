import type { ReactNode } from "react";
import { useLocale } from "../i18n/LocaleContext";
import type { AsyncState } from "../shared/useAsync";

interface AsyncContentProps<T> {
  state: AsyncState<T>;
  children: (data: T) => ReactNode;
}

/** One place for loading and error presentation, so every data-driven block behaves the same. */
export function AsyncContent<T>({ state, children }: AsyncContentProps<T>) {
  const { ui } = useLocale();
  if (state.status === "loading")
    return (
      <p className="status" aria-busy="true">
        {ui.loading}
      </p>
    );
  if (state.status === "error") return <p className="status status--error">{ui.loadFailed}</p>;
  return <>{children(state.data)}</>;
}
