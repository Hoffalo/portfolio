import { useMemo, useState } from "react";
import { FURNITURE, type Placement } from "../../game/world/catalog";
import { runFixtureAction } from "../../game/world/fixtureActions";
import { buildRoomWorld, carouselCentre, wallPiecesOf } from "../../game/world/roomLayout";
import type { Fixture } from "../../game/world/world";
import { useLocale } from "../../i18n/LocaleContext";
import type { Exhibit, SectionDefinition } from "../../sections/types";
import { useOpenExhibit } from "../../sections/useOpenExhibit";
import { usePopups } from "../../ui/popup/PopupContext";
import { GameStage } from "./GameStage";

interface RoomViewProps {
  section: SectionDefinition;
  onExit: () => void;
}

export function RoomView({ section, onExit }: RoomViewProps) {
  const { t, ui } = useLocale();
  const { isOpen: isInspecting } = usePopups();
  const openExhibit = useOpenExhibit();
  const exhibits = section.useExhibits();
  // Which wall piece the carousel starts at; turning it rebuilds the wall but keeps the player in place.
  const [wallOffset, setWallOffset] = useState(0);
  const world = useMemo(() => buildRoomWorld(exhibits, wallOffset), [exhibits, wallOffset]);
  const wallCount = wallPiecesOf(exhibits).length;

  const exhibitFor = ({ action }: Fixture) =>
    action.type === "inspect"
      ? exhibits.find((exhibit) => exhibit.id === action.exhibitId)
      : undefined;

  const labelFor = (fixture: Fixture) => {
    if (fixture.action.type === "rotate") return fixture.action.step < 0 ? ui.previous : ui.next;
    return `${ui.inspect} · ${exhibitFor(fixture)?.label ?? ""}`;
  };

  const runAction = (action: Fixture["action"]) =>
    runFixtureAction(action, {
      exitRoom: onExit,
      rotate: ({ step }) => setWallOffset((offset) => offset + step),
      inspect: ({ exhibitId }) => {
        const exhibit = exhibits.find((candidate) => candidate.id === exhibitId);
        if (exhibit) openExhibit(exhibit);
      },
    });

  const renderFixture = (fixture: Fixture) => {
    if (fixture.action.type === "rotate") {
      const { action } = fixture;
      return (
        <>
          <button
            type="button"
            className="hotspot"
            aria-label={labelFor(fixture)}
            title={labelFor(fixture)}
            onClick={() => runAction(action)}
          />
          {action.step > 0 && (
            <span className="plaque carousel-count" data-placement="wall" aria-live="polite">
              {carouselCentre(wallOffset, wallCount) + 1} / {wallCount}
            </span>
          )}
        </>
      );
    }
    const exhibit = exhibitFor(fixture);
    if (!exhibit) return null;
    const placement = FURNITURE[exhibit.furniture].placement;
    return (
      <>
        <button
          type="button"
          className="hotspot"
          aria-label={labelFor(fixture)}
          title={exhibit.label}
          onClick={() => runAction(fixture.action)}
        />
        <span className="plaque" data-placement={placement} aria-hidden="true">
          {exhibit.caption ?? exhibit.label}
        </span>
        {!isInspecting && <PeekCard exhibit={exhibit} placement={placement} />}
      </>
    );
  };

  return (
    <GameStage
      world={world}
      worldKey={`room:${section.id}`}
      label={`${t(section.title)} — ${ui.gameLabel}`}
      paused={isInspecting}
      renderFixture={renderFixture}
      describeFixture={labelFor}
      onAction={runAction}
    >
      <header className="room-banner">
        <h1 className="room-banner__title">{t(section.title)}</h1>
        <button type="button" className="room-banner__exit" onClick={onExit}>
          ← {ui.backToTown}
        </button>
      </header>
    </GameStage>
  );
}

/**
 * A little card that pops up over whatever the visitor walks up to or hovers, so the room explains
 * itself before anything is opened. CSS reveals it; wall pieces show it below, everything else above.
 */
function PeekCard({ exhibit, placement }: { exhibit: Exhibit; placement: Placement }) {
  const { ui } = useLocale();
  return (
    <div className="peek" data-placement={placement} aria-hidden="true">
      <strong className="peek__title">{exhibit.caption ?? exhibit.label}</strong>
      {exhibit.teaser?.map((line) => (
        <span key={line} className="peek__line">
          {line}
        </span>
      ))}
      <span className="peek__hint">
        <kbd>E</kbd> {exhibit.detail ? ui.inspect : ui.open}
      </span>
    </div>
  );
}
