import { useCallback, useSyncExternalStore } from "react";
import { parseRoute, routeToHash, type Route } from "./route";

function subscribe(onChange: () => void) {
  addEventListener("hashchange", onChange);
  return () => removeEventListener("hashchange", onChange);
}

const readHash = () => location.hash;

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, readHash);
  const navigate = useCallback((route: Route) => {
    location.hash = routeToHash(route);
  }, []);
  return [parseRoute(hash), navigate] as const;
}
