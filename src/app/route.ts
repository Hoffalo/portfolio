/**
 * Hash routes keep the site deployable as static files while giving every room and page a shareable URL:
 *   #/               the town
 *   #/room/career    inside a building
 *   #/read/career    boring mode
 */
export type Route =
  { view: "town" } | { view: "room"; sectionId: string } | { view: "read"; sectionId: string };

export function parseRoute(hash: string): Route {
  const [view, sectionId] = hash.replace(/^#\/?/, "").split("/");
  if ((view === "room" || view === "read") && sectionId)
    return { view, sectionId: decodeURIComponent(sectionId) };
  return { view: "town" };
}

export function routeToHash(route: Route): string {
  return route.view === "town" ? "#/" : `#/${route.view}/${encodeURIComponent(route.sectionId)}`;
}
