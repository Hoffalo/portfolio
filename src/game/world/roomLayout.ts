import type { Exhibit } from "../../sections/types";
import { bottom, wrap, type Rect } from "../engine/geometry";
import { FURNITURE, placeProp, propSolid, PROP_SIZE, type Placement } from "./catalog";
import {
  baseOf,
  type Carousel,
  type Fixture,
  type FixtureVisual,
  type Prop,
  type World,
} from "./world";

const WALL_HEIGHT = 44;
const SIDE_WALL = 8;
const MIN_WIDTH = 224;
const CELL = { width: 58, height: 52 };
const MAX_COLUMNS = 4;
const WALL_GAP = 16;
const MAT = { width: 24, height: 8 };
const WINDOW = { width: 26, height: 22, top: 10, margin: 8 };
/** Entrance pieces stand this far from the middle of the walkway, and this far above the bottom wall. */
const AISLE = 16;
const LOBBY_MARGIN = 14;
/** How many wall pieces show at once; with more, the wall becomes a carousel turned by two switches. */
export const CAROUSEL_SIZE = 3;
const SWITCH = { width: 12, height: 14 };
/** How far in front of a piece the visitor can stand and still use it. */
const REACH = 14;

type RoomExhibit = Pick<
  Exhibit,
  "id" | "furniture" | "image" | "accent" | "lit" | "levels" | "motif"
>;

/** Everything the placement steps share: which pieces go where, and the room's size. */
interface RoomPlan {
  width: number;
  height: number;
  cx: number;
  wall: {
    /** Every wall piece; only `pieces` are showing when the wall is a carousel. */
    all: RoomExhibit[];
    pieces: RoomExhibit[];
    offset: number;
    carousel: boolean;
    slotWidth: number;
    span: number;
  };
  floor: { pieces: RoomExhibit[]; columns: number; rows: number; left: number };
  entrance: { pieces: RoomExhibit[]; lobbyHeight: number };
}

/** Pieces, and the parts of them that block walking. */
interface Placed {
  fixtures: Fixture[];
  solids: Rect[];
}

/**
 * A Pokémon-style interior: wall-mounted exhibits hang along the back wall, floor exhibits stand in
 * rows with walkways between them, and a mat by the bottom wall leads back outside. Entrance pieces
 * stand in a lobby beside the mat, so they greet the visitor however far the room grows.
 *
 * When there are more wall pieces than fit at once, the wall shows `CAROUSEL_SIZE` of them, starting
 * at `wallOffset` (wrapping around), between two switches that turn it.
 */
export function buildRoomWorld(exhibits: readonly RoomExhibit[], wallOffset = 0): World {
  const plan = planRoom(exhibits, wallOffset);
  const floor = standOnFloor(plan);
  const entrance = standAtEntrance(plan);
  const wall = hangOnWall(plan);
  const fixtures = [...wall.fixtures, ...floor.fixtures, ...entrance.fixtures];
  const mat = { x: plan.cx - MAT.width / 2, y: plan.height - MAT.height, ...MAT };
  const props = furnish(plan);

  return {
    kind: "room",
    width: plan.width,
    height: plan.height,
    ground: {
      type: "room",
      wallHeight: WALL_HEIGHT,
      windows: windowsBetween(fixtures, plan.width),
      mat,
      rug: {
        x: plan.floor.left + 6,
        y: WALL_HEIGHT + 10,
        width: plan.floor.columns * CELL.width - 12,
        height: plan.floor.rows * CELL.height + 30,
      },
    },
    fixtures,
    props,
    portals: [
      {
        zone: { x: mat.x, y: plan.height - 10, width: mat.width, height: 10 },
        facing: "down",
        action: { type: "exitRoom" },
      },
    ],
    obstacles: [
      ...walls(plan, mat),
      ...floor.solids,
      ...entrance.solids,
      ...props.map(propSolid).filter((solid): solid is Rect => solid !== null),
    ],
    actors: [],
    spawn: { x: plan.cx, y: plan.height - 16, facing: "up" },
    carousel: wall.carousel,
  };
}

export const wallPiecesOf = <T extends Pick<Exhibit, "furniture">>(exhibits: readonly T[]) =>
  piecesFor(exhibits, "wall");

/** The piece in the carousel's middle slot, counting from 0, so the visitor knows where they are. */
export const carouselCentre = (wallOffset: number, wallCount: number) =>
  wrap(wallOffset + Math.floor(CAROUSEL_SIZE / 2), wallCount);

function piecesFor<T extends Pick<Exhibit, "furniture">>(
  exhibits: readonly T[],
  placement: Placement,
): T[] {
  return exhibits.filter((exhibit) => FURNITURE[exhibit.furniture].placement === placement);
}

const sizeOf = (exhibit: RoomExhibit) => FURNITURE[exhibit.furniture];
const widest = (pieces: readonly RoomExhibit[]) =>
  Math.max(0, ...pieces.map((p) => sizeOf(p).width));
const tallest = (pieces: readonly RoomExhibit[]) =>
  Math.max(0, ...pieces.map((p) => sizeOf(p).height));

function planRoom(exhibits: readonly RoomExhibit[], wallOffset: number): RoomPlan {
  const allOnWall = piecesFor(exhibits, "wall");
  const onFloor = piecesFor(exhibits, "floor");
  const atEntrance = piecesFor(exhibits, "entrance");

  const carousel = allOnWall.length > CAROUSEL_SIZE;
  const onWall = carousel
    ? Array.from(
        { length: CAROUSEL_SIZE },
        (_, slot) => allOnWall[wrap(wallOffset + slot, allOnWall.length)]!,
      )
    : allOnWall;
  // Slots are as wide as the widest piece in the whole set, so the room never changes size as it turns.
  const slotWidth = widest(allOnWall);
  const wallSpan = carousel
    ? CAROUSEL_SIZE * slotWidth + (CAROUSEL_SIZE + 1) * WALL_GAP + 2 * SWITCH.width
    : onWall.reduce((sum, exhibit) => sum + sizeOf(exhibit).width, 0) +
      WALL_GAP * Math.max(0, onWall.length - 1);

  const columns = Math.min(MAX_COLUMNS, Math.max(2, Math.ceil(Math.sqrt(onFloor.length * 1.6))));
  // Even a gallery with only wall exhibits gets a proper floor to stroll across.
  const rows = Math.max(1, Math.ceil(onFloor.length / columns));

  const lobbyHeight = tallest(atEntrance);
  // Room for the widest entrance piece on either side of the walkway, clear of the corner plants.
  const lobbyWidth = atEntrance.length
    ? 2 * (widest(atEntrance) + AISLE + SIDE_WALL + PROP_SIZE.plant.width + 6)
    : 0;

  const width = Math.max(MIN_WIDTH, columns * CELL.width + 48, wallSpan + 56, lobbyWidth);
  const height =
    WALL_HEIGHT + 16 + rows * CELL.height + 48 + (lobbyHeight ? lobbyHeight + LOBBY_MARGIN : 0);

  return {
    width,
    height,
    cx: Math.round(width / 2),
    wall: {
      all: allOnWall,
      pieces: onWall,
      offset: wallOffset,
      carousel,
      slotWidth,
      span: wallSpan,
    },
    floor: {
      pieces: onFloor,
      columns,
      rows,
      left: Math.round((width - columns * CELL.width) / 2),
    },
    entrance: { pieces: atEntrance, lobbyHeight },
  };
}

function exhibitFixture(exhibit: RoomExhibit, bounds: Rect, zone: Rect): Fixture {
  return {
    id: exhibit.id,
    bounds,
    zone,
    visual: furnitureVisual(exhibit),
    action: { type: "inspect", exhibitId: exhibit.id },
  };
}

const furnitureVisual = (exhibit: RoomExhibit): FixtureVisual => ({
  type: "furniture",
  kind: exhibit.furniture,
  details: {
    image: exhibit.image,
    accent: exhibit.accent,
    lit: exhibit.lit,
    levels: exhibit.levels,
    motif: exhibit.motif,
  },
});

/** Where a piece hangs when centred in a slot of the given width. */
function hang(exhibit: RoomExhibit, slotX: number, slot: number): Rect {
  const size = sizeOf(exhibit);
  return {
    x: slotX + Math.round((slot - size.width) / 2),
    y: WALL_HEIGHT - size.height - 6,
    ...size,
  };
}

function hangOnWall({ width, wall }: RoomPlan): { fixtures: Fixture[]; carousel?: Carousel } {
  const fixtures: Fixture[] = [];
  let x = Math.round((width - wall.span) / 2);

  const wallSwitch = (direction: -1 | 1) => {
    fixtures.push({
      id: direction < 0 ? "carousel-previous" : "carousel-next",
      bounds: { x, y: WALL_HEIGHT - SWITCH.height - 12, ...SWITCH },
      zone: { x: x - 4, y: WALL_HEIGHT, width: SWITCH.width + 8, height: REACH },
      visual: { type: "switch", direction },
      action: { type: "rotate", step: direction },
    });
    x += SWITCH.width + WALL_GAP;
  };

  if (wall.carousel) wallSwitch(-1);
  const stripStart = x;
  for (const exhibit of wall.pieces) {
    const slot = wall.carousel ? wall.slotWidth : sizeOf(exhibit).width;
    const bounds = hang(exhibit, x, slot);
    fixtures.push(
      exhibitFixture(exhibit, bounds, {
        x: bounds.x - 2,
        y: WALL_HEIGHT,
        width: bounds.width + 4,
        height: REACH,
      }),
    );
    x += slot + WALL_GAP;
  }
  const stripEnd = x;
  if (wall.carousel) wallSwitch(1);

  return {
    fixtures,
    carousel: wall.carousel ? turningWall(wall, stripStart, stripEnd) : undefined,
  };
}

/** What the renderer needs to slide the wall pieces along when the carousel turns. */
function turningWall(wall: RoomPlan["wall"], stripStart: number, stripEnd: number): Carousel {
  const pitch = wall.slotWidth + WALL_GAP;
  return {
    offset: wall.offset,
    // Each edge sits halfway between a switch and the nearest slot.
    strip: {
      x: stripStart - WALL_GAP / 2,
      y: 0,
      width: stripEnd - stripStart,
      height: WALL_HEIGHT,
    },
    pitch,
    ids: wall.pieces.map((exhibit) => exhibit.id),
    neighbours: [-1, CAROUSEL_SIZE].map((slot) => {
      const exhibit = wall.all[wrap(wall.offset + slot, wall.all.length)]!;
      return {
        visual: furnitureVisual(exhibit),
        bounds: hang(exhibit, stripStart + slot * pitch, wall.slotWidth),
      };
    }),
  };
}

function standOnFloor({ floor }: RoomPlan): Placed {
  const placed: Placed = { fixtures: [], solids: [] };
  floor.pieces.forEach((exhibit, index) => {
    const size = sizeOf(exhibit);
    const cellX = floor.left + (index % floor.columns) * CELL.width;
    const cellY = WALL_HEIGHT + 16 + Math.floor(index / floor.columns) * CELL.height;
    const bounds = {
      x: Math.round(cellX + (CELL.width - size.width) / 2),
      y: cellY + CELL.height - 16 - size.height,
      ...size,
    };
    placed.fixtures.push(
      exhibitFixture(exhibit, bounds, {
        x: bounds.x - 6,
        y: bottom(bounds) - 2,
        width: size.width + 12,
        height: REACH,
      }),
    );
    placed.solids.push(baseOf(bounds, Math.min(size.height, 12)));
  });
  return placed;
}

/**
 * Entrance pieces alternate left and right of the walkway, working outwards; their zone is the
 * stretch of walkway beside them, which the visitor is standing on as they come in.
 */
function standAtEntrance({ cx, height, entrance }: RoomPlan): Placed {
  const placed: Placed = { fixtures: [], solids: [] };
  const sideOffset = [0, 0];
  entrance.pieces.forEach((exhibit, index) => {
    const size = sizeOf(exhibit);
    const side = index % 2;
    const x = side === 0 ? cx - AISLE - sideOffset[0]! - size.width : cx + AISLE + sideOffset[1]!;
    sideOffset[side]! += size.width + 8;
    const bounds = { x, y: height - LOBBY_MARGIN - size.height, ...size };
    placed.fixtures.push(
      exhibitFixture(exhibit, bounds, {
        x: side === 0 ? bounds.x + bounds.width : cx - AISLE - 4,
        y: bottom(bounds) - 24,
        width: AISLE + 4,
        height: 26,
      }),
    );
    placed.solids.push(baseOf(bounds, 4));
  });
  return placed;
}

function furnish({ width, height, cx, floor, entrance }: RoomPlan): Prop[] {
  const rightCorner = width - SIDE_WALL - PROP_SIZE.plant.width - 2;
  const bottomCorner = height - PROP_SIZE.plant.height - 6;
  return [
    ...(floor.pieces.length === 0 ? galleryBenches(cx, WALL_HEIGHT + 16 + CELL.height / 2) : []),
    placeProp("plant", SIDE_WALL + 2, WALL_HEIGHT - 6, 1),
    placeProp("plant", rightCorner, WALL_HEIGHT - 6, 2),
    placeProp("plant", SIDE_WALL + 2, bottomCorner, 3),
    placeProp("plant", rightCorner, bottomCorner, 4),
    nappingPet({ width, height, cx, entrance }),
  ];
}

/** Every home needs a pet, napping by the door on the side the entrance pieces leave free. */
function nappingPet({
  width,
  height,
  cx,
  entrance,
}: Pick<RoomPlan, "width" | "height" | "cx" | "entrance">): Prop {
  const count = entrance.pieces.length;
  const x =
    count > 1
      ? cx + AISLE + 4
      : count === 1
        ? width - SIDE_WALL - PROP_SIZE.plant.width - PROP_SIZE.pet.width - 8
        : SIDE_WALL + PROP_SIZE.plant.width + 8;
  const lobbyClearance = count > 1 ? entrance.lobbyHeight + LOBBY_MARGIN : 0;
  return placeProp("pet", x, height - PROP_SIZE.pet.height - 8 - lobbyClearance);
}

/** The back and side walls, and the bottom wall either side of the mat (the way out). */
function walls({ width, height }: RoomPlan, mat: Rect): Rect[] {
  return [
    { x: 0, y: 0, width, height: WALL_HEIGHT },
    { x: 0, y: 0, width: SIDE_WALL, height },
    { x: width - SIDE_WALL, y: 0, width: SIDE_WALL, height },
    { x: 0, y: height - 4, width: mat.x, height: 4 },
    { x: mat.x + mat.width, y: height - 4, width: width - mat.x - mat.width, height: 4 },
  ];
}

function galleryBenches(cx: number, y: number) {
  const { width } = PROP_SIZE.bench;
  return [placeProp("bench", cx - width - 10, y), placeProp("bench", cx + 10, y)];
}

/** Windows fill the stretches of back wall that no exhibit uses, so walls never look bare. */
function windowsBetween(fixtures: readonly Fixture[], width: number): Rect[] {
  const hung = fixtures
    .filter((fixture) => bottom(fixture.bounds) <= WALL_HEIGHT)
    .map((fixture) => fixture.bounds)
    .sort((a, b) => a.x - b.x);
  const edges = [
    SIDE_WALL + 14,
    ...hung.flatMap((bounds) => [bounds.x, bounds.x + bounds.width]),
    width - SIDE_WALL - 14,
  ];

  const windows: Rect[] = [];
  for (let index = 0; index < edges.length; index += 2) {
    const start = edges[index]!;
    const gap = edges[index + 1]! - start;
    const count = Math.floor((gap - WINDOW.margin) / (WINDOW.width + WINDOW.margin));
    const used = count * WINDOW.width + (count - 1) * WINDOW.margin;
    for (let window = 0; window < count; window++) {
      windows.push({
        x: Math.round(start + (gap - used) / 2 + window * (WINDOW.width + WINDOW.margin)),
        y: WINDOW.top,
        width: WINDOW.width,
        height: WINDOW.height,
      });
    }
  }
  return windows;
}
