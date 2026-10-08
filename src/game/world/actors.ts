import type { ActorRole, ActorSpawn } from "./world";
import type { Rect, Vec } from "../engine/geometry";

/** A wandering creature: walks to a random spot in its area, idles, then picks another. */
export interface Actor extends Vec {
  role: ActorRole;
  area: Rect;
  target: Vec;
  /** Seconds left idling before choosing a new target. */
  rest: number;
  facing: "left" | "right";
  moving: boolean;
  /** Per-actor random state, so wandering is reproducible. */
  rng: number;
  /** Desynchronises animations between otherwise identical actors. */
  phase: number;
}

interface Temperament {
  speed: number;
  minRest: number;
  maxRest: number;
}

const TEMPERAMENT: Record<ActorRole, Temperament> = {
  companion: { speed: 26, minRest: 1, maxRest: 4 },
  hopper: { speed: 34, minRest: 0.6, maxRest: 3 },
  flock: { speed: 14, minRest: 0.4, maxRest: 2 },
  grazer: { speed: 6, minRest: 3, maxRest: 8 },
  roller: { speed: 10, minRest: 2, maxRest: 5 },
};

/** Mulberry32: tiny, fast, good enough for wandering animals. */
function nextRandom(state: number): [number, number] {
  let t = (state + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, state + 0x6d2b79f5];
}

function randomPointIn(area: Rect, rng: number): [Vec, number] {
  const [rx, afterX] = nextRandom(rng);
  const [ry, afterY] = nextRandom(afterX);
  return [{ x: area.x + rx * area.width, y: area.y + ry * area.height }, afterY];
}

export function spawnActors(spawns: readonly ActorSpawn[]): Actor[] {
  let seed = 7;
  return spawns.flatMap((spawn) =>
    Array.from({ length: spawn.count }, () => {
      const [start, afterStart] = randomPointIn(spawn.area, seed++ * 7919);
      const [rest, rng] = nextRandom(afterStart);
      return {
        ...start,
        role: spawn.role,
        area: spawn.area,
        target: start,
        rest: rest * TEMPERAMENT[spawn.role].maxRest,
        facing: rest > 0.5 ? "left" : "right",
        moving: false,
        rng,
        phase: rest * 10,
      } satisfies Actor;
    }),
  );
}

export function stepActor(actor: Actor, seconds: number): Actor {
  const temperament = TEMPERAMENT[actor.role];
  if (actor.rest > 0) return { ...actor, rest: actor.rest - seconds, moving: false };

  const dx = actor.target.x - actor.x;
  const dy = actor.target.y - actor.y;
  const distance = Math.hypot(dx, dy);
  const step = temperament.speed * Math.min(seconds, 0.1);

  if (distance <= step) {
    const [target, afterTarget] = randomPointIn(actor.area, actor.rng);
    const [restRoll, rng] = nextRandom(afterTarget);
    const rest = temperament.minRest + restRoll * (temperament.maxRest - temperament.minRest);
    return { ...actor, x: actor.target.x, y: actor.target.y, target, rest, rng, moving: false };
  }

  return {
    ...actor,
    x: actor.x + (dx / distance) * step,
    y: actor.y + (dy / distance) * step,
    facing: dx < 0 ? "left" : "right",
    moving: true,
  };
}
