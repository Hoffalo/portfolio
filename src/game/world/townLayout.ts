import type { SocialLink } from "../../content/types";
import type { BuildingKind } from "../../sections/types";
import { bottom, centerX, intersects, type Rect, type Vec } from "../engine/geometry";
import { placeProp, propSolid, PROP_SIZE } from "./catalog";
import type { ActorSpawn, Fixture, PathSegment, Portal, Prop, World } from "./world";

export const BUILDING_SIZE: Record<BuildingKind, { width: number; height: number }> = {
  residence: { width: 70, height: 66 },
  corporate: { width: 74, height: 86 },
  datacenter: { width: 80, height: 66 },
  theater: { width: 82, height: 72 },
};

const WIDTH = 480;
/** Open sky above the skyline; the camera sits low and looks up into it, like a stage backdrop. */
const SKY = 148;
const HORIZON = SKY;
const TREELINE = SKY - 8;
const RIVER = { y: SKY + 28, height: 20 };
const BRIDGE_WIDTH = 24;
const PLAZA_TOP = SKY + 56;
/** How far the forest keeps going past the edges, so wide screens never see the end of the world. */
const FOREST_OVERHANG = 112;
const SLOT_HEIGHT = 86;
const ROW_PITCH = 112;
/** Distance from the central avenue to each building column. */
const COLUMN_OFFSET = 128;
const ENTRANCE_DEPTH = 84;
const YARD = { inset: 40, height: 136 };
const DOOR = { width: 12, height: 16 };
const SIGN = { width: 30, height: 26 };
const PATH_WIDTH = 12;
const FENCE = 3;

export interface TownInput {
  sections: readonly { id: string; building: BuildingKind }[];
  signs: readonly SocialLink[];
  /** The section the player just left, so they reappear at its door. */
  arrivingFrom?: string;
}

/**
 * The town, top to bottom: a horizon, a treeline and a river; a plaza where paths fan out from a
 * fountain to the section buildings (two per row, so more sections extend it southwards); an
 * entrance with the social signs; and a fenced farm (or garage lot) at the southern edge.
 */
export function buildTownWorld({ sections, signs, arrivingFrom }: TownInput): World {
  const rows = Math.max(1, Math.ceil(sections.length / 2));
  const cx = WIDTH / 2;
  const baselineOf = (row: number) => PLAZA_TOP + SLOT_HEIGHT + row * ROW_PITCH;
  const lastBaseline = baselineOf(rows - 1);
  const fountainCenter = { x: cx, y: Math.round((PLAZA_TOP + lastBaseline) / 2) };
  const entranceY = lastBaseline + 16;
  const yard = {
    x: YARD.inset,
    y: lastBaseline + ENTRANCE_DEPTH,
    width: WIDTH - YARD.inset * 2,
    height: YARD.height,
  };
  const height = bottom(yard) + 34;

  const fixtures: Fixture[] = [];
  const portals: Portal[] = [];
  const paths: PathSegment[] = [];
  const props: Prop[] = [];

  sections.forEach((section, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const baseline = baselineOf(Math.floor(index / 2));
    const size = BUILDING_SIZE[section.building];
    const bounds = {
      x: Math.round(cx + side * COLUMN_OFFSET - size.width / 2),
      y: baseline - size.height,
      ...size,
    };
    const door = {
      x: Math.round(centerX(bounds) - DOOR.width / 2),
      y: baseline - DOOR.height,
      ...DOOR,
    };
    const action = { type: "enterSection", sectionId: section.id } as const;

    fixtures.push({
      id: `building-${section.id}`,
      bounds,
      zone: { x: door.x - 6, y: baseline, width: DOOR.width + 12, height: 14 },
      visual: { type: "building", kind: section.building, door },
      action,
    });
    portals.push({
      zone: { x: door.x, y: baseline, width: DOOR.width, height: 6 },
      facing: "up",
      action,
    });
    paths.push({
      from: fountainCenter,
      to: { x: centerX(door), y: baseline + 6 },
      width: PATH_WIDTH,
    });

    // Each building gets a lantern by the door and a little clutter around it.
    const outerSide = side < 0 ? bounds.x - 12 : bounds.x + bounds.width + 4;
    props.push(
      placeProp(
        "lamp",
        door.x + (side < 0 ? DOOR.width + 8 : -14),
        baseline - PROP_SIZE.lamp.height + 2,
        index,
      ),
      placeProp("barrel", outerSide, baseline - 12, index),
      placeProp("crate", outerSide + (side < 0 ? -2 : 2), baseline - 22, index),
      placeProp(
        "bush",
        side < 0 ? bounds.x + bounds.width + 4 : bounds.x - 16,
        baseline - PROP_SIZE.bush.height,
        index,
      ),
    );
  });

  // North to the bridge over the river, and the avenue south through the entrance to the farm gate.
  paths.push({
    from: fountainCenter,
    to: { x: cx, y: RIVER.y + RIVER.height + 2 },
    width: PATH_WIDTH,
  });
  paths.push({ from: fountainCenter, to: { x: cx, y: yard.y + 4 }, width: PATH_WIDTH + 2 });

  const fountain = placeProp(
    "fountain",
    fountainCenter.x - PROP_SIZE.fountain.width / 2,
    fountainCenter.y - PROP_SIZE.fountain.height + 16,
  );
  const plaza = { x: cx - 56, y: fountainCenter.y - 40, width: 112, height: 74 };
  const campfireX = cx + 56;
  const campfireY = fountainCenter.y + 22;
  props.push(
    fountain,
    placeProp("campfire", campfireX, campfireY),
    placeProp("bench", campfireX - 4, campfireY + 16, 1),
    placeProp("rock", campfireX + 22, campfireY + 4, 2),
    placeProp("bench", cx - 76, fountainCenter.y + 26, 3),
    placeProp("flowers", plaza.x - 4, plaza.y + 6, 1),
    placeProp("flowers", plaza.x + plaza.width - 10, plaza.y + 6, 2),
  );

  signs.forEach((link, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const bounds = {
      x: Math.round(cx + side * (PATH_WIDTH / 2 + 16) - (side < 0 ? SIGN.width : 0)),
      y: entranceY + 8,
      ...SIGN,
    };
    fixtures.push({
      id: `sign-${link.id}`,
      bounds,
      zone: { x: bounds.x - 4, y: bottom(bounds), width: bounds.width + 8, height: 12 },
      visual: { type: "sign", brand: link.id },
      action: { type: "openLink", url: link.url },
    });
  });
  props.push(placeProp("stall", cx - 150, entranceY + 6, 1));

  const pen = { x: cx + 24, y: yard.y + 18, width: yard.width / 2 - 40, height: yard.height - 36 };
  props.push(...farm(yard, pen, cx), ...forest(height, cx));

  const occupied = [
    ...fixtures.map((fixture) => fixture.bounds),
    ...props.map((prop) => prop.bounds),
    plaza,
    yard,
    { x: 0, y: 0, width: WIDTH, height: RIVER.y + RIVER.height + 6 },
  ];
  props.push(...groundCover(height, occupied, paths));

  const bridge = {
    x: cx - BRIDGE_WIDTH / 2,
    y: RIVER.y - 4,
    width: BRIDGE_WIDTH,
    height: RIVER.height + 8,
  };
  const obstacles = [
    // The forest beyond the river is scenery; the river is only crossable on the bridge, which leads nowhere.
    { x: 0, y: 0, width: WIDTH, height: RIVER.y },
    { x: 0, y: RIVER.y, width: bridge.x, height: RIVER.height },
    {
      x: bridge.x + bridge.width,
      y: RIVER.y,
      width: WIDTH - bridge.x - bridge.width,
      height: RIVER.height,
    },
    ...fixtures.map((fixture) =>
      fixture.visual.type === "sign"
        ? { x: centerX(fixture.bounds) - 2, y: bottom(fixture.bounds) - 3, width: 4, height: 3 }
        : fixture.bounds,
    ),
    ...props.map(propSolid).filter((solid): solid is Rect => solid !== null),
  ];

  const plazaArea = { x: cx - 150, y: entranceY, width: 300, height: 48 };
  const actors: ActorSpawn[] = [
    { role: "companion", area: plazaArea, count: 2 },
    {
      role: "hopper",
      area: { x: 34, y: PLAZA_TOP + 10, width: 30, height: lastBaseline - PLAZA_TOP },
      count: 1,
    },
    {
      role: "hopper",
      area: { x: WIDTH - 64, y: PLAZA_TOP + 10, width: 30, height: lastBaseline - PLAZA_TOP },
      count: 1,
    },
    {
      role: "flock",
      area: {
        x: yard.x + 12,
        y: yard.y + 74,
        width: pen.x - yard.x - 28,
        height: yard.height - 86,
      },
      count: 5,
    },
    {
      role: "grazer",
      area: { x: pen.x + 10, y: pen.y + 14, width: pen.width - 40, height: pen.height / 2 - 10 },
      count: 3,
    },
    {
      role: "roller",
      area: {
        x: pen.x + 10,
        y: pen.y + pen.height / 2 + 10,
        width: pen.width - 30,
        height: pen.height / 2 - 22,
      },
      count: 2,
    },
  ];

  const arrival = fixtures.find((fixture) => fixture.id === `building-${arrivingFrom}`);
  const spawn = arrival
    ? { x: centerX(arrival.bounds), y: bottom(arrival.bounds) + 8, facing: "down" as const }
    : { x: cx, y: entranceY + 52, facing: "up" as const };

  return {
    kind: "town",
    width: WIDTH,
    height,
    ground: {
      type: "town",
      horizon: HORIZON,
      river: { x: 0, ...RIVER, width: WIDTH },
      bridge,
      paths,
      plaza,
      yard,
      pen,
    },
    fixtures,
    props,
    portals,
    obstacles,
    actors,
    spawn,
  };
}

/** A fenced yard with a gate in the north fence, a barn, a vehicle, and a pen for the larger animals. */
function farm(yard: Rect, pen: Rect, cx: number): Prop[] {
  const gate = 18;
  const fence = (x: number, y: number, width: number, height: number, seed: number) =>
    placeProp("fence", x, y, seed, { width, height });

  return [
    fence(yard.x, yard.y, cx - gate - yard.x, FENCE, 1),
    fence(cx + gate, yard.y, yard.x + yard.width - cx - gate, FENCE, 2),
    fence(yard.x, yard.y, FENCE, yard.height, 3),
    fence(yard.x + yard.width - FENCE, yard.y, FENCE, yard.height, 4),
    fence(yard.x, bottom(yard) - FENCE, yard.width, FENCE, 5),
    fence(pen.x, pen.y, pen.width, FENCE, 6),
    fence(pen.x, pen.y, FENCE, pen.height, 7),
    fence(pen.x + pen.width - FENCE, pen.y, FENCE, pen.height, 8),
    fence(pen.x, bottom(pen) - FENCE, pen.width, FENCE, 9),
    placeProp("barn", yard.x + 14, yard.y + 10),
    placeProp("cart", yard.x + 106, yard.y + 44),
    placeProp("barrel", yard.x + 102, yard.y + 22, 1),
    placeProp("crate", yard.x + 112, yard.y + 24, 2),
    placeProp("vehicle", cx - 74, yard.y + 34),
    placeProp("trough", pen.x + pen.width - 34, pen.y + pen.height - 20),
    placeProp("lamp", yard.x + 8, yard.y + 76, 3),
    placeProp("lamp", cx - gate - 8, yard.y - 20, 4),
    placeProp("lamp", cx + gate + 2, yard.y - 20, 5),
  ];
}

/** A dense forest wall around the town: a treeline under the horizon and staggered trees down both sides. */
function forest(height: number, cx: number): Prop[] {
  const trees: Prop[] = [];
  let seed = 100;
  for (let x = -FOREST_OVERHANG; x < WIDTH + FOREST_OVERHANG; x += 14) {
    const stagger = Math.abs(Math.round(x / 14)) % 2;
    trees.push(placeProp("tree", x, TREELINE + stagger * 6, seed++));
    if (Math.abs(x + 11 - cx) > 30)
      trees.push(placeProp("tree", x, height - 30 + stagger * 4, seed++));
  }
  for (let row = 0, y = RIVER.y + RIVER.height + 4; y < height - 30; row++, y += 18) {
    const stagger = row % 2 ? 8 : 0;
    // Columns step outwards from each edge: the inner two are the town's border, the rest fill the overhang.
    for (let column = 0; column * 16 < FOREST_OVERHANG; column++) {
      const offset = column * 16 - stagger;
      const dy = (column % 2) * 9;
      trees.push(
        placeProp("tree", 6 - offset, y + dy, seed++),
        placeProp("tree", WIDTH - 28 + offset, y + dy, seed++),
      );
    }
  }
  return trees;
}

/** Scatters mushrooms, rocks, flowers and bushes on open grass, away from paths and buildings. */
function groundCover(
  height: number,
  occupied: readonly Rect[],
  paths: readonly PathSegment[],
): Prop[] {
  const kinds = ["mushrooms", "flowers", "rock", "bush", "flowers", "mushrooms"] as const;
  const cover: Prop[] = [];
  let seed = 0;
  for (let y = PLAZA_TOP; y < height - 40; y += 15) {
    for (let x = 40; x < WIDTH - 50; x += 17) {
      seed++;
      const roll = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
      if (roll > 0.28) continue;
      const kind = kinds[Math.floor(roll * 100) % kinds.length]!;
      const prop = placeProp(kind, x + roll * 10, y + roll * 6, seed);
      const area = {
        ...prop.bounds,
        x: prop.bounds.x - 4,
        y: prop.bounds.y - 4,
        width: prop.bounds.width + 8,
        height: prop.bounds.height + 8,
      };
      if (occupied.some((rect) => intersects(rect, area))) continue;
      if (paths.some((path) => distanceToSegment(centre(prop.bounds), path) < path.width / 2 + 8))
        continue;
      cover.push(prop);
    }
  }
  return cover;
}

const centre = (rect: Rect): Vec => ({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });

export function distanceToSegment(point: Vec, { from, to }: PathSegment): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const lengthSquared = dx * dx + dy * dy || 1;
  const t = Math.max(
    0,
    Math.min(1, ((point.x - from.x) * dx + (point.y - from.y) * dy) / lengthSquared),
  );
  return Math.hypot(point.x - (from.x + t * dx), point.y - (from.y + t * dy));
}
