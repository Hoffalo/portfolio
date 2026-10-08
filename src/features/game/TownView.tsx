import { useMemo } from "react";
import { profile, TOWN_SIGNS } from "../../content/profile";
import type { Fixture, FixtureAction } from "../../game/world/world";
import { buildTownWorld } from "../../game/world/townLayout";
import { useLocale } from "../../i18n/LocaleContext";
import { findSection, sections } from "../../sections/registry";
import { openExternal } from "../../shared/openExternal";
import { GameStage } from "./GameStage";

interface TownViewProps {
  arrivingFrom?: string;
  onEnter: (sectionId: string) => void;
}

const signs = profile.links.filter((link) => TOWN_SIGNS.includes(link.id));

export function TownView({ arrivingFrom, onEnter }: TownViewProps) {
  const { t, ui } = useLocale();
  const world = useMemo(() => buildTownWorld({ sections, signs, arrivingFrom }), [arrivingFrom]);

  const resolve = ({ action }: Fixture) => {
    if (action.type === "enterSection") {
      const section = findSection(action.sectionId);
      return (
        section && {
          kind: "building" as const,
          title: t(section.title),
          label: `${ui.enter} · ${t(section.title)}`,
        }
      );
    }
    if (action.type === "openLink") {
      const link = signs.find((sign) => sign.url === action.url);
      return link && { kind: "sign" as const, link, label: `${ui.open} · ${link.label}` };
    }
    return undefined;
  };

  const runAction = (action: FixtureAction) => {
    if (action.type === "enterSection") onEnter(action.sectionId);
    if (action.type === "openLink") openExternal(action.url);
  };

  const renderFixture = (fixture: Fixture) => {
    const target = resolve(fixture);
    if (target?.kind === "building") {
      return (
        <button
          type="button"
          className="hotspot"
          aria-label={target.label}
          onClick={() => runAction(fixture.action)}
        >
          <span className="roof-label">{target.title}</span>
        </button>
      );
    }
    if (target?.kind === "sign") {
      return (
        <a className="sign-label" href={target.link.url} target="_blank" rel="noopener noreferrer">
          {target.link.label}
        </a>
      );
    }
    return null;
  };

  return (
    <GameStage
      world={world}
      worldKey={`town:${arrivingFrom ?? ""}`}
      label={ui.gameLabel}
      renderFixture={renderFixture}
      describeFixture={(fixture) => resolve(fixture)?.label ?? ""}
      onAction={runAction}
    />
  );
}
