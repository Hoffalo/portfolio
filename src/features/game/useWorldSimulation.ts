import { useEffect, useRef, type RefObject } from "react";
import { ART_BY_STYLE } from "../../game/art";
import { paintWorld } from "../../game/art/paintWorld";
import { spawnActors, stepActor } from "../../game/world/actors";
import { cameraOffset } from "../../game/engine/camera";
import { containsPoint } from "../../game/engine/geometry";
import type { DirectionInput } from "../../game/engine/input";
import { startLoop } from "../../game/engine/loop";
import { feetBox, stepPlayer, type Player } from "../../game/engine/physics";
import {
  findTriggeredPortal,
  findUsableFixture,
  isBlockedIn,
  type FixtureAction,
  type World,
} from "../../game/world/world";
import type { ArtStyle } from "../../theme/theme";
import { computePixelViewport } from "./viewport";

interface SimulationOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  world: World;
  /** Changes when the player should respawn (entering a different place). */
  worldKey: string;
  artStyle: ArtStyle;
  input: DirectionInput;
  paused: boolean;
  reducedMotion: boolean;
  onNearbyChange: (fixtureId: string | undefined) => void;
  onPortal: (action: FixtureAction) => void;
}

const CAMERA_EASING = 8;
/** The camera frames the player below centre, looking up the street towards the skyline. */
const LOOK_AHEAD = 0.3;

/**
 * Owns the per-frame work: moving the player, easing the camera, painting the canvas and
 * keeping the HTML overlay aligned. React only hears about it when something meaningful changes.
 */
export function useWorldSimulation(options: SimulationOptions) {
  // Latest props are read through a ref so the loop isn't torn down on every render.
  const latest = useRef(options);
  useEffect(() => {
    latest.current = options;
  });

  const { worldKey, containerRef, canvasRef, overlayRef } = options;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const ctx = canvas?.getContext("2d");
    if (!container || !canvas || !overlay || !ctx) return;

    let player: Player = { ...latest.current.world.spawn, moving: false };
    let actorWorld = latest.current.world;
    let actors = spawnActors(actorWorld.actors);
    let camera: { x: number; y: number } | undefined;
    let nearbyId: string | undefined;
    let portalArmed = false;

    const stop = startLoop((seconds, now) => {
      const { world, artStyle, input, paused, reducedMotion, onNearbyChange, onPortal } =
        latest.current;
      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      const viewport = computePixelViewport(width, height, world);
      if (canvas.width !== viewport.width || canvas.height !== viewport.height) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width * viewport.scale}px`;
        canvas.style.height = `${viewport.height * viewport.scale}px`;
      }

      const isBlocked = isBlockedIn(world);
      // The world can change under the player (e.g. a room growing as GitHub data arrives).
      if (isBlocked(feetBox(player))) player = { ...world.spawn, moving: false };
      const direction = paused ? { x: 0, y: 0 } : input.vector();
      player = stepPlayer(player, direction, seconds, isBlocked);
      if (world !== actorWorld) {
        actorWorld = world;
        actors = spawnActors(world.actors);
      }
      if (!reducedMotion) actors = actors.map((actor) => stepActor(actor, seconds));

      // Portals fire on entry only, so stepping back out of a room doesn't immediately re-enter it.
      if (!world.portals.some((candidate) => containsPoint(candidate.zone, player)))
        portalArmed = true;
      const pushing = direction.x !== 0 || direction.y !== 0;
      const portal = findTriggeredPortal(world, player, player.facing, pushing);
      if (portal && portalArmed) {
        portalArmed = false;
        onPortal(portal.action);
      }

      const target = {
        x: cameraOffset(player.x, viewport.width, world.width),
        y: cameraOffset(
          player.y - 12 - (world.kind === "town" ? viewport.height * LOOK_AHEAD : 0),
          viewport.height,
          world.height,
        ),
      };
      const easing = Math.min(1, seconds * CAMERA_EASING);
      camera = camera
        ? {
            x: camera.x + (target.x - camera.x) * easing,
            y: camera.y + (target.y - camera.y) * easing,
          }
        : target;
      const view = {
        x: Math.round(camera.x),
        y: Math.round(camera.y),
        width: viewport.width,
        height: viewport.height,
      };

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;
      paintWorld(
        { ctx, world, view, time: reducedMotion ? 0 : now },
        ART_BY_STYLE[artStyle],
        player,
        actors,
      );

      overlay.style.setProperty("--scale", String(viewport.scale));
      overlay.style.transform = `translate3d(${-view.x * viewport.scale}px, ${-view.y * viewport.scale}px, 0)`;

      const nearby = findUsableFixture(world, player)?.id;
      if (nearby !== nearbyId) {
        nearbyId = nearby;
        onNearbyChange(nearby);
      }
    });

    return stop;
  }, [worldKey, containerRef, canvasRef, overlayRef]);
}
