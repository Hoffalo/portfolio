import { useMemo, useState } from "react";
import { FURNITURE, type Placement } from "../../game/world/catalog";
import { CAROUSEL_SIZE } from "../../game/world/roomLayout";
import type { Fixture, FixtureAction } from "../../game/world/world";
import { buildRoomWorld } from "../../game/world/roomLayout";
import { useLocale } from "../../i18n/LocaleContext";
import type { Exhibit, SectionDefinition } from "../../sections/types";
import { openExternal } from "../../shared/openExternal";
import { DialogBox } from "./DialogBox";
import { GameStage } from "./GameStage";

interface RoomViewProps {
  section: SectionDefinition;
  onExit: () => void;
}

export function RoomView({ section, onExit }: RoomViewProps) {
  const { t, ui } = useLocale();
  const exhibits = section.useExhibits();
  // Which wall piece the carousel starts at; turning it rebuilds the wall but keeps the player in place.
  const [wallOffset, setWallOffset] = useState(0);
  const world = useMemo(() => buildRoomWorld(exhibits, wallOffset), [exhibits, wallOffset]);
  const wallCount = exhibits.filter(
    (exhibit) => FURNITURE[exhibit.furniture].placement === "wall",
  ).length;
  const [inspectedId, setInspectedId] = useState<string>();
  const inspected = exhibits.find((exhibit) => exhibit.id === inspectedId);

  const exhibitFor = ({ action }: Fixture) =>
    action.type === "inspect"
      ? exhibits.find((exhibit) => exhibit.id === action.exhibitId)
      : undefined;

  const runAction = (action: FixtureAction) => {
    if (action.type === "exitRoom") return onExit();
    if (action.type === "rotate") return setWallOffset((offset) => offset + action.step);
    if (action.type !== "inspect") return;
    const exhibit = exhibits.find((candidate) => candidate.id === action.exhibitId);
    if (exhibit?.detail) setInspectedId(exhibit.id);
    else if (exhibit?.href) openExternal(exhibit.href);
  };

  const renderFixture = (fixture: Fixture) => {
    if (fixture.action.type === "rotate") {
      const { action } = fixture;
      const label = action.step < 0 ? ui.previous : ui.next;
      // The piece in the middle slot, counting from 1, so the visitor knows where they are.
      const centre =
        (((wallOffset + Math.floor(CAROUSEL_SIZE / 2)) % wallCount) + wallCount) % wallCount;
      return (
        <>
          <button
            type="button"
            className="hotspot"
            aria-label={label}
            title={label}
            onClick={() => runAction(action)}
          />
          {action.step > 0 && (
            <span className="plaque carousel-count" data-placement="wall" aria-live="polite">
              {centre + 1} / {wallCount}
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
          aria-label={`${ui.inspect} · ${exhibit.label}`}
          title={exhibit.label}
          onClick={() => runAction(fixture.action)}
        />
        <span className="plaque" data-placement={placement} aria-hidden="true">
          {exhibit.caption ?? exhibit.label}
        </span>
        {!inspected && <PeekCard exhibit={exhibit} placement={placement} />}
      </>
    );
  };

  return (
    <GameStage
      world={world}
      worldKey={`room:${section.id}`}
      label={`${t(section.title)} — ${ui.gameLabel}`}
      paused={Boolean(inspected)}
      renderFixture={renderFixture}
      describeFixture={(fixture) =>
        fixture.action.type === "rotate"
          ? fixture.action.step < 0
            ? ui.previous
            : ui.next
          : `${ui.inspect} · ${exhibitFor(fixture)?.label ?? ""}`
      }
      onAction={runAction}
    >
      <header className="room-banner">
        <h1 className="room-banner__title">{t(section.title)}</h1>
        <button type="button" className="room-banner__exit" onClick={onExit}>
          ← {ui.backToTown}
        </button>
      </header>
      {inspected && (
        <DialogBox title={inspected.label} onClose={() => setInspectedId(undefined)}>
          {inspected.detail}
        </DialogBox>
      )}
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
