import type { Exhibit } from "../../sections/types";
import { bottom, type Rect } from "../engine/geometry";
import { FURNITURE, placeProp, propSolid, PROP_SIZE } from "./catalog";
import { baseOf, type Carousel, type Fixture, type FixtureVisual, type World } from "./world";

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

type RoomExhibit = Pick<
  Exhibit,
  "id" | "furniture" | "image" | "accent" | "lit" | "levels" | "motif"
>;

/**
 * A Pokémon-style interior: wall-mounted exhibits hang along the back wall, floor exhibits stand in
 * rows with walkways between them, and a mat by the bottom wall leads back outside. Entrance pieces
 * stand in a lobby beside the mat, so they greet the visitor however far the room grows.
 *
 * When there are more wall pieces than fit at once, the wall shows `CAROUSEL_SIZE` of them, starting
 * at `wallOffset` (wrapping around), between two switches that turn it.
 */
export function buildRoomWorld(exhibits: readonly RoomExhibit[], wallOffset = 0): World {
  const allOnWall = exhibits.filter((exhibit) => FURNITURE[exhibit.furniture].placement === "wall");
  const carousel = allOnWall.length > CAROUSEL_SIZE;
  const onWall = carousel
    ? Array.from(
        { length: CAROUSEL_SIZE },
        (_, slot) => allOnWall[mod(wallOffset + slot, allOnWall.length)]!,
      )
    : allOnWall;
  // Slots are as wide as the widest piece in the whole set, so the room never changes size as it turns.
  const slotWidth = Math.max(0, ...allOnWall.map(({ furniture }) => FURNITURE[furniture].width));
  const onFloor = exhibits.filter((exhibit) => FURNITURE[exhibit.furniture].placement === "floor");
  const atEntrance = exhibits.filter(
    (exhibit) => FURNITURE[exhibit.furniture].placement === "entrance",
  );
  const lobbyHeight = Math.max(
    0,
    ...atEntrance.map(({ furniture }) => FURNITURE[furniture].height),
  );
  // Room for the widest entrance piece on either side of the walkway, clear of the corner plants.
  const lobbyWidth = atEntrance.length
    ? 2 *
      (Math.max(...atEntrance.map(({ furniture }) => FURNITURE[furniture].width)) +
        AISLE +
        SIDE_WALL +
        PROP_SIZE.plant.width +
        6)
    : 0;

  const columns = Math.min(MAX_COLUMNS, Math.max(2, Math.ceil(Math.sqrt(onFloor.length * 1.6))));
  // Even a gallery with only wall exhibits gets a proper floor to stroll across.
  const rows = Math.max(1, Math.ceil(onFloor.length / columns));
  const wallSpan = carousel
    ? CAROUSEL_SIZE * slotWidth + (CAROUSEL_SIZE + 1) * WALL_GAP + 2 * SWITCH.width
    : onWall.reduce((sum, exhibit) => sum + FURNITURE[exhibit.furniture].width, 0) +
      WALL_GAP * Math.max(0, onWall.length - 1);

  const width = Math.max(MIN_WIDTH, columns * CELL.width + 48, wallSpan + 56, lobbyWidth);
  const height =
    WALL_HEIGHT + 16 + rows * CELL.height + 48 + (lobbyHeight ? lobbyHeight + LOBBY_MARGIN : 0);
  const cx = Math.round(width / 2);

  const fixtures: Fixture[] = [];
  const inspect = (exhibit: RoomExhibit, bounds: Rect, zone: Rect): Fixture => ({
    id: exhibit.id,
    bounds,
    zone,
    visual: furnitureVisual(exhibit),
    action: { type: "inspect", exhibitId: exhibit.id },
  });

  let wallX = Math.round((width - wallSpan) / 2);
  const wallSwitch = (direction: -1 | 1) => {
    const bounds = { x: wallX, y: WALL_HEIGHT - SWITCH.height - 12, ...SWITCH };
    fixtures.push({
      id: direction < 0 ? "carousel-previous" : "carousel-next",
      bounds,
      zone: { x: wallX - 4, y: WALL_HEIGHT, width: SWITCH.width + 8, height: 14 },
      visual: { type: "switch", direction },
      action: { type: "rotate", step: direction },
    });
    wallX += SWITCH.width + WALL_GAP;
  };
  const hang = (exhibit: RoomExhibit, slotX: number, slot: number): Rect => {
    const size = FURNITURE[exhibit.furniture];
    const x = slotX + Math.round((slot - size.width) / 2);
    return { x, y: WALL_HEIGHT - size.height - 6, ...size };
  };
  if (carousel) wallSwitch(-1);
  const stripStart = wallX;
  for (const exhibit of onWall) {
    const slot = carousel ? slotWidth : FURNITURE[exhibit.furniture].width;
    const bounds = hang(exhibit, wallX, slot);
    fixtures.push(
      inspect(exhibit, bounds, {
        x: bounds.x - 2,
        y: WALL_HEIGHT,
        width: bounds.width + 4,
        height: 14,
      }),
    );
    wallX += slot + WALL_GAP;
  }
  const stripEnd = wallX;
  if (carousel) wallSwitch(1);

  const pitch = slotWidth + WALL_GAP;
  const turningWall: Carousel | undefined = carousel
    ? {
        offset: wallOffset,
        // Each edge sits halfway between a switch and the nearest slot.
        strip: {
          x: stripStart - WALL_GAP / 2,
          y: 0,
          width: stripEnd - stripStart,
          height: WALL_HEIGHT,
        },
        pitch,
        ids: onWall.map((exhibit) => exhibit.id),
        neighbours: [-1, CAROUSEL_SIZE].map((slot) => {
          const exhibit = allOnWall[mod(wallOffset + slot, allOnWall.length)]!;
          return {
            visual: furnitureVisual(exhibit),
            bounds: hang(exhibit, stripStart + slot * pitch, slotWidth),
          };
        }),
      }
    : undefined;

  const gridLeft = Math.round((width - columns * CELL.width) / 2);
  const furnitureSolids: Rect[] = [];
  onFloor.forEach((exhibit, index) => {
    const size = FURNITURE[exhibit.furniture];
    const cellX = gridLeft + (index % columns) * CELL.width;
    const cellY = WALL_HEIGHT + 16 + Math.floor(index / columns) * CELL.height;
    const bounds = {
      x: Math.round(cellX + (CELL.width - size.width) / 2),
      y: cellY + CELL.height - 16 - size.height,
      ...size,
    };
    fixtures.push(
      inspect(exhibit, bounds, {
        x: bounds.x - 6,
        y: bottom(bounds) - 2,
        width: size.width + 12,
        height: 14,
      }),
    );
    furnitureSolids.push(baseOf(bounds, Math.min(size.height, 12)));
  });

  // Entrance pieces alternate left and right of the walkway, working outwards; their zone is the
  // stretch of walkway beside them, which the visitor is standing on as they come in.
  const sideOffset = [0, 0];
  atEntrance.forEach((exhibit, index) => {
    const size = FURNITURE[exhibit.furniture];
    const side = index % 2;
    const x = side === 0 ? cx - AISLE - sideOffset[0]! - size.width : cx + AISLE + sideOffset[1]!;
    sideOffset[side]! += size.width + 8;
    const bounds = { x, y: height - LOBBY_MARGIN - size.height, ...size };
    fixtures.push(
      inspect(exhibit, bounds, {
        x: side === 0 ? bounds.x + bounds.width : cx - AISLE - 4,
        y: bottom(bounds) - 24,
        width: AISLE + 4,
        height: 26,
      }),
    );
    furnitureSolids.push(baseOf(bounds, 4));
  });

  const mat = { x: cx - MAT.width / 2, y: height - MAT.height, ...MAT };
  const props = [
    ...(onFloor.length === 0 ? galleryBenches(cx, WALL_HEIGHT + 16 + CELL.height / 2) : []),
    placeProp("plant", SIDE_WALL + 2, WALL_HEIGHT - 6, 1),
    placeProp("plant", width - SIDE_WALL - PROP_SIZE.plant.width - 2, WALL_HEIGHT - 6, 2),
    placeProp("plant", SIDE_WALL + 2, height - PROP_SIZE.plant.height - 6, 3),
    placeProp(
      "plant",
      width - SIDE_WALL - PROP_SIZE.plant.width - 2,
      height - PROP_SIZE.plant.height - 6,
      4,
    ),
    // Every home needs a pet, napping by the door (on the side the entrance pieces leave free).
    placeProp(
      "pet",
      atEntrance.length > 1
        ? cx + AISLE + 4
        : atEntrance.length === 1
          ? width - SIDE_WALL - PROP_SIZE.plant.width - PROP_SIZE.pet.width - 8
          : SIDE_WALL + PROP_SIZE.plant.width + 8,
      height - PROP_SIZE.pet.height - 8 - (atEntrance.length > 1 ? lobbyHeight + LOBBY_MARGIN : 0),
    ),
  ];

  const obstacles: Rect[] = [
    { x: 0, y: 0, width, height: WALL_HEIGHT },
    { x: 0, y: 0, width: SIDE_WALL, height },
    { x: width - SIDE_WALL, y: 0, width: SIDE_WALL, height },
    { x: 0, y: height - 4, width: mat.x, height: 4 },
    { x: mat.x + mat.width, y: height - 4, width: width - mat.x - mat.width, height: 4 },
    ...furnitureSolids,
    ...props.map(propSolid).filter((solid): solid is Rect => solid !== null),
  ];

  return {
    kind: "room",
    width,
    height,
    ground: {
      type: "room",
      wallHeight: WALL_HEIGHT,
      windows: windowsBetween(fixtures, width),
      mat,
      rug: {
        x: gridLeft + 6,
        y: WALL_HEIGHT + 10,
        width: columns * CELL.width - 12,
        height: rows * CELL.height + 30,
      },
    },
    fixtures,
    props,
    portals: [
      {
        zone: { x: mat.x, y: height - 10, width: mat.width, height: 10 },
        facing: "down",
        action: { type: "exitRoom" },
      },
    ],
    obstacles,
    actors: [],
    spawn: { x: cx, y: height - 16, facing: "up" },
    carousel: turningWall,
  };
}

const mod = (value: number, length: number) => ((value % length) + length) % length;

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
