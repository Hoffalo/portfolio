import { BoringView } from "../features/boring/BoringView";
import { GameView } from "../features/game/GameView";
import { useLocale } from "../i18n/LocaleContext";
import { findSection, sections } from "../sections/registry";
import { routeToHash } from "./route";
import { TopBar } from "./TopBar";
import { useRoute } from "./useRoute";

export function App() {
  const { ui } = useLocale();
  const [route, navigate] = useRoute();
  const firstSection = sections[0]!;

  return (
    <div className="app" data-view={route.view}>
      <a className="skip-link" href={routeToHash({ view: "read", sectionId: firstSection.id })}>
        {ui.skipToContent}
      </a>
      <TopBar route={route} />
      {route.view === "read" ? (
        <BoringView section={findSection(route.sectionId) ?? firstSection} />
      ) : (
        <>
          <GameView
            roomId={route.view === "room" ? route.sectionId : undefined}
            onEnterRoom={(sectionId) => navigate({ view: "room", sectionId })}
            onLeaveRoom={() => navigate({ view: "town" })}
          />
          <a
            className="mobile-hint"
            href={routeToHash({
              view: "read",
              sectionId: route.view === "room" ? route.sectionId : firstSection.id,
            })}
          >
            {ui.mobileHint}
          </a>
        </>
      )}
    </div>
  );
}
