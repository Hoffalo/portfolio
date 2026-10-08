import { useEffect, useRef } from "react";
import { routeToHash } from "../../app/route";
import { profile } from "../../content/profile";
import { useLocale } from "../../i18n/LocaleContext";
import { sections } from "../../sections/registry";
import type { SectionDefinition } from "../../sections/types";
import { ExternalLink } from "../../ui/ExternalLink";

export function BoringView({ section }: { section: SectionDefinition }) {
  const { t, ui } = useLocale();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const number = String(sections.indexOf(section) + 1).padStart(2, "0");

  // Moving focus to the new heading tells screen readers the page changed, and resets scroll.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    scrollTo({ top: 0 });
  }, [section]);

  return (
    <div className="reader">
      <aside className="reader__sidebar">
        <div className="reader__identity">
          <img
            className="avatar avatar--small"
            src={profile.avatarUrl}
            alt=""
            width={56}
            height={56}
          />
          <div>
            <p className="reader__name">{profile.name}</p>
            <p className="muted">{t(profile.headline)}</p>
          </div>
        </div>

        <nav aria-label={ui.sections}>
          <ul className="reader__nav">
            {sections.map((item, index) => (
              <li key={item.id}>
                <a
                  className="reader__nav-link"
                  href={routeToHash({ view: "read", sectionId: item.id })}
                  aria-current={item.id === section.id ? "page" : undefined}
                >
                  <span className="reader__nav-number">{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="reader__nav-title">{t(item.title)}</span>
                    <span className="reader__nav-tagline">{t(item.tagline)}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="reader__contact">
          <h2 className="reader__contact-title">{ui.contact}</h2>
          <a className="text-link" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          {profile.links.map((link) => (
            <ExternalLink key={link.id} href={link.url}>
              {link.label}
            </ExternalLink>
          ))}
        </div>
      </aside>

      <main className="reader__main" id="main">
        <header className="reader__header">
          <p className="reader__kicker">{number}</p>
          <h1 className="reader__title" ref={headingRef} tabIndex={-1}>
            {t(section.title)}
          </h1>
          <p className="reader__tagline">{t(section.tagline)}</p>
        </header>
        <section.Page />
      </main>
    </div>
  );
}
