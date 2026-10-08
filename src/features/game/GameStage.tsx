import { useMemo, useRef, useState, type ReactNode } from "react";
import { DirectionInput } from "../../game/engine/input";
import type { Fixture, FixtureAction, World } from "../../game/world/world";
import { useLocale } from "../../i18n/LocaleContext";
import { usePrefersReducedMotion } from "../../shared/usePrefersReducedMotion";
import { useTheme } from "../../theme/ThemeContext";
import { TouchControls } from "./TouchControls";
import { useKeyboardControls } from "./useKeyboardControls";
import { useWorldSimulation } from "./useWorldSimulation";

interface GameStageProps {
  world: World;
  worldKey: string;
  label: string;
  paused?: boolean;
  /** HTML laid over a fixture: labels and accessible buttons. */
  renderFixture: (fixture: Fixture, isNearby: boolean) => ReactNode;
  /** Text for the "press E" prompt, e.g. "Enter · Career". */
  describeFixture: (fixture: Fixture) => string;
  /** Runs a fixture's action, whether triggered by E, a click, or walking through a door. */
  onAction: (action: FixtureAction) => void;
  /** Extra HUD for the current place (room title, dialog box). */
  children?: ReactNode;
}

export function GameStage({
  world,
  worldKey,
  label,
  paused = false,
  renderFixture,
  describeFixture,
  onAction,
  children,
}: GameStageProps) {
  const { ui } = useLocale();
  const { artStyle } = useTheme();
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const input = useMemo(() => new DirectionInput(), []);
  const [nearbyId, setNearbyId] = useState<string>();

  const nearby = world.fixtures.find((fixture) => fixture.id === nearbyId);

  useWorldSimulation({
    containerRef,
    canvasRef,
    overlayRef,
    world,
    worldKey,
    artStyle,
    input,
    paused,
    reducedMotion,
    onNearbyChange: setNearbyId,
    onPortal: onAction,
  });
  useKeyboardControls({
    input,
    enabled: !paused,
    onInteract: () => nearby && onAction(nearby.action),
  });

  return (
    <div
      className="stage"
      ref={containerRef}
      role="region"
      aria-label={label}
      data-world={world.kind}
    >
      <canvas ref={canvasRef} className="stage__canvas" aria-hidden="true" />
      <div ref={overlayRef} className="stage__overlay">
        <div className="stage__world" style={{ width: world.width, height: world.height }}>
          {world.fixtures.map((fixture) => (
            <div
              key={fixture.id}
              className="fixture"
              data-kind={fixture.visual.type}
              data-nearby={fixture.id === nearbyId || undefined}
              data-carousel={world.carousel?.ids.includes(fixture.id) || undefined}
              style={{
                left: fixture.bounds.x,
                top: fixture.bounds.y,
                width: fixture.bounds.width,
                height: fixture.bounds.height,
              }}
            >
              {renderFixture(fixture, fixture.id === nearbyId)}
            </div>
          ))}
        </div>
      </div>

      <div className="hud">
        {nearby && !paused && (
          <button type="button" className="hud__prompt" onClick={() => onAction(nearby.action)}>
            <kbd>E</kbd> {describeFixture(nearby)}
          </button>
        )}
        <p className="hud__hint" aria-hidden="true">
          <kbd>W</kbd>
          <kbd>A</kbd>
          <kbd>S</kbd>
          <kbd>D</kbd> {ui.walkHint} · <kbd>E</kbd> {ui.interactHint}
        </p>
        <TouchControls input={input} />
      </div>
      {children}
    </div>
  );
}
