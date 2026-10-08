import { profile } from "../content/profile";
import { useLocale } from "../i18n/LocaleContext";
import { sections } from "../sections/registry";
import { useTheme } from "../theme/ThemeContext";
import { routeToHash, type Route } from "./route";

/** Boring mode and play mode mirror each other: the same section stays open when switching. */
function counterpartRoute(route: Route): Route {
  if (route.view === "read") return { view: "room", sectionId: route.sectionId };
  if (route.view === "room") return { view: "read", sectionId: route.sectionId };
  return { view: "read", sectionId: sections[0]!.id };
}

export function TopBar({ route }: { route: Route }) {
  const { t, ui, locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const isReading = route.view === "read";

  return (
    <header className="top-bar">
      <a className="top-bar__brand" href={routeToHash({ view: "town" })}>
        <span className="top-bar__name">{profile.name}</span>
        <span className="top-bar__headline">{t(profile.headline)}</span>
      </a>
      <div className="top-bar__actions">
        <button
          type="button"
          className="chip"
          onClick={() => setLocale(locale === "en" ? "pt" : "en")}
          aria-label={ui.switchLanguage}
          title={ui.switchLanguage}
        >
          {locale === "en" ? "PT" : "EN"}
        </button>
        <button
          type="button"
          className="chip"
          onClick={toggleTheme}
          aria-label={theme === "cyberpunk" ? ui.switchToLight : ui.switchToDark}
          title={theme === "cyberpunk" ? ui.switchToLight : ui.switchToDark}
        >
          <span aria-hidden="true">{theme === "cyberpunk" ? "☀" : "☾"}</span>
        </button>
        <a className="chip chip--primary" href={routeToHash(counterpartRoute(route))}>
          {isReading ? ui.playMode : ui.boringMode}
        </a>
      </div>
    </header>
  );
}
