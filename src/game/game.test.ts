import { describe, expect, it } from "vitest";
import { cameraOffset } from "./engine/camera";
import { containsPoint } from "./engine/geometry";
import { DirectionInput, directionForKey } from "./engine/input";
import { feetBox, stepPlayer, WALK_SPEED, type Player } from "./engine/physics";
import { FURNITURE } from "./world/catalog";
import { buildRoomWorld } from "./world/roomLayout";
import { spawnActors, stepActor } from "./world/actors";
import { buildTownWorld, distanceToSegment } from "./world/townLayout";
import { findTriggeredPortal, findUsableFixture, isBlockedIn } from "./world/world";

const player = (overrides: Partial<Player> = {}): Player => ({
  x: 100,
  y: 100,
  facing: "down",
  moving: false,
  ...overrides,
});
const nothingBlocks = () => false;

describe("stepPlayer", () => {
  it("stands still without input but keeps facing", () => {
    expect(
      stepPlayer(player({ facing: "left" }), { x: 0, y: 0 }, 0.016, nothingBlocks),
    ).toMatchObject({
      x: 100,
      facing: "left",
      moving: false,
    });
  });

  it("walks at walking speed and faces the direction of travel", () => {
    const moved = stepPlayer(player(), { x: 0, y: -1 }, 0.02, nothingBlocks);
    expect(moved.y).toBeCloseTo(100 - WALK_SPEED * 0.02);
    expect(moved.facing).toBe("up");
  });

  it("is not faster diagonally", () => {
    const moved = stepPlayer(player(), { x: 1, y: 1 }, 0.02, nothingBlocks);
    expect(Math.hypot(moved.x - 100, moved.y - 100)).toBeCloseTo(WALK_SPEED * 0.02);
  });

  it("slides along a wall instead of stopping dead", () => {
    const wallToTheRight = (feet: { x: number }) => feet.x + 8 > 104;
    const moved = stepPlayer(player(), { x: 1, y: 1 }, 0.05, wallToTheRight);
    expect(moved.x).toBeLessThanOrEqual(100);
    expect(moved.y).toBeGreaterThan(100);
  });

  it("caps long frames so the player can't tunnel through walls", () => {
    const moved = stepPlayer(player(), { x: 1, y: 0 }, 5, nothingBlocks);
    expect(moved.x - 100).toBeLessThanOrEqual(WALK_SPEED * 0.05 + 0.001);
  });
});

describe("cameraOffset", () => {
  it("centres on the focus inside a large world", () => {
    expect(cameraOffset(500, 200, 1000)).toBe(400);
  });

  it("clamps at both world edges", () => {
    expect(cameraOffset(10, 200, 1000)).toBe(0);
    expect(cameraOffset(990, 200, 1000)).toBe(800);
  });

  it("centres worlds smaller than the view", () => {
    expect(cameraOffset(50, 400, 200)).toBe(-100);
  });
});

describe("DirectionInput", () => {
  it("maps WASD and arrows to directions", () => {
    expect(directionForKey("W")).toBe("up");
    expect(directionForKey("ArrowLeft")).toBe("left");
    expect(directionForKey("q")).toBeUndefined();
  });

  it("cancels opposing directions", () => {
    const input = new DirectionInput();
    input.press("left");
    input.press("right");
    input.press("down");
    expect(input.vector()).toEqual({ x: 0, y: 1 });
  });
});

describe("town", () => {
  const sections = [
    { id: "about", building: "residence" as const },
    { id: "career", building: "corporate" as const },
    { id: "dev", building: "datacenter" as const },
    { id: "videos", building: "theater" as const },
  ];
  const signs = [
    { id: "linkedin" as const, label: "LinkedIn", url: "https://linkedin.example" },
    { id: "github" as const, label: "GitHub", url: "https://github.example" },
  ];
  const town = buildTownWorld({ sections, signs });

  it("places buildings in two columns around a central fountain", () => {
    const fountain = town.props.find((prop) => prop.kind === "fountain")!;
    const buildings = town.fixtures.filter((fixture) => fixture.visual.type === "building");
    const fountainX = fountain.bounds.x + fountain.bounds.width / 2;
    expect(buildings).toHaveLength(4);
    expect(buildings.filter((b) => b.bounds.x + b.bounds.width < fountainX)).toHaveLength(2);
    expect(buildings.filter((b) => b.bounds.x > fountainX)).toHaveLength(2);
  });

  it("grows north when more sections are added", () => {
    const bigger = buildTownWorld({
      sections: [...sections, { id: "extra", building: "residence" }],
      signs,
    });
    expect(bigger.height).toBeGreaterThan(town.height);
  });

  it("spawns walkable at the entrance, and at a building's door when returning", () => {
    expect(isBlockedIn(town)(feetBox(town.spawn))).toBe(false);
    const returning = buildTownWorld({ sections, signs, arrivingFrom: "dev" });
    const dev = returning.fixtures.find((fixture) => fixture.id === "building-dev")!;
    expect(isBlockedIn(returning)(feetBox(returning.spawn))).toBe(false);
    expect(Math.abs(returning.spawn.x - (dev.bounds.x + dev.bounds.width / 2))).toBeLessThan(1);
  });

  it("enters a building by walking up into its door", () => {
    const career = town.fixtures.find((fixture) => fixture.id === "building-career")!;
    const door = career.visual.type === "building" ? career.visual.door : undefined;
    const feet = { x: door!.x + door!.width / 2, y: door!.y + door!.height + 3 };
    expect(findTriggeredPortal(town, feet, "up", true)?.action).toEqual({
      type: "enterSection",
      sectionId: "career",
    });
    expect(findTriggeredPortal(town, feet, "down", true)).toBeUndefined();
    expect(findUsableFixture(town, feet)?.id).toBe("building-career");
  });

  it("has a sign for every social link", () => {
    expect(town.fixtures.filter((fixture) => fixture.visual.type === "sign")).toHaveLength(2);
  });
});

describe("room", () => {
  const exhibits = [
    { id: "painting", furniture: "painting-wide" as const },
    { id: "desk-1", furniture: "desk" as const },
    { id: "desk-2", furniture: "desk" as const },
    { id: "rack", furniture: "rack" as const },
  ];
  const room = buildRoomWorld(exhibits);

  it("hangs wall furniture on the wall and stands floor furniture on the floor", () => {
    const wallHeight = room.ground.type === "room" ? room.ground.wallHeight : 0;
    for (const fixture of room.fixtures) {
      const kind = fixture.visual.type === "furniture" ? fixture.visual.kind : undefined;
      const onWall = fixture.bounds.y + fixture.bounds.height <= wallHeight;
      expect(onWall).toBe(FURNITURE[kind!].placement === "wall");
      if (FURNITURE[kind!].placement === "entrance")
        expect(fixture.bounds.y).toBeGreaterThan(wallHeight);
    }
  });

  it("lets the player reach every exhibit's interaction zone", () => {
    const isBlocked = isBlockedIn(room);
    for (const fixture of room.fixtures) {
      const spot = {
        x: fixture.zone.x + fixture.zone.width / 2,
        y: fixture.zone.y + fixture.zone.height / 2,
      };
      expect(isBlocked(feetBox(spot)), fixture.id).toBe(false);
      expect(containsPoint(fixture.zone, spot)).toBe(true);
    }
  });

  it("greets the visitor with entrance pieces: the spawn point is inside their zone", () => {
    const lobby = buildRoomWorld([
      ...exhibits,
      { id: "stats", furniture: "contributions" as const },
    ]);
    const stats = lobby.fixtures.find((fixture) => fixture.id === "stats")!;
    expect(containsPoint(stats.zone, lobby.spawn)).toBe(true);
    expect(isBlockedIn(lobby)(feetBox(lobby.spawn))).toBe(false);
    expect(stats.bounds.x).toBeGreaterThanOrEqual(8);
    expect(stats.bounds.x + stats.bounds.width).toBeLessThan(lobby.spawn.x);
  });

  it("leads back outside through the mat", () => {
    const mat = room.ground.type === "room" ? room.ground.mat : undefined;
    const feet = { x: mat!.x + mat!.width / 2, y: room.height - 2 };
    expect(isBlockedIn(room)(feetBox(feet))).toBe(false);
    expect(findTriggeredPortal(room, feet, "down", true)?.action).toEqual({ type: "exitRoom" });
  });

  it("gets wider with more wall exhibits and taller with more floor exhibits", () => {
    const wider = buildRoomWorld([
      ...exhibits,
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `p${i}`,
        furniture: "painting-wide" as const,
      })),
    ]);
    const taller = buildRoomWorld([
      ...exhibits,
      ...Array.from({ length: 12 }, (_, i) => ({ id: `d${i}`, furniture: "desk" as const })),
    ]);
    expect(wider.width).toBeGreaterThan(room.width);
    expect(taller.height).toBeGreaterThan(room.height);
  });

  it("turns a crowded wall into a carousel: three pieces at a time, between two switches", () => {
    const paintings = Array.from({ length: 8 }, (_, i) => ({
      id: `p${i}`,
      furniture: i % 3 ? ("painting-wide" as const) : ("painting-tall" as const),
    }));
    const shown = (offset: number) => {
      const wall = buildRoomWorld(paintings, offset);
      return { wall, ids: wall.fixtures.filter((f) => f.id.startsWith("p")).map((f) => f.id) };
    };
    const first = shown(0);
    expect(first.ids).toEqual(["p0", "p1", "p2"]);
    expect(shown(1).ids).toEqual(["p1", "p2", "p3"]);
    expect(shown(-1).ids).toEqual(["p7", "p0", "p1"]);
    expect(shown(5).wall.width).toBe(first.wall.width);
    const switches = first.wall.fixtures.filter((f) => f.action.type === "rotate");
    expect(switches.map((f) => f.action)).toEqual([
      { type: "rotate", step: -1 },
      { type: "rotate", step: 1 },
    ]);
    const isBlocked = isBlockedIn(first.wall);
    for (const { zone } of switches) {
      const spot = { x: zone.x + zone.width / 2, y: zone.y + zone.height / 2 };
      expect(isBlocked(feetBox(spot))).toBe(false);
    }
  });

  it("puts windows only where the wall is free", () => {
    const windows = room.ground.type === "room" ? room.ground.windows : [];
    const painting = room.fixtures.find((fixture) => fixture.id === "painting")!.bounds;
    expect(windows.length).toBeGreaterThan(0);
    for (const window of windows) {
      const overlaps =
        window.x < painting.x + painting.width && painting.x < window.x + window.width;
      expect(overlaps).toBe(false);
    }
  });
});

describe("wandering creatures", () => {
  const area = { x: 10, y: 20, width: 50, height: 30 };
  const inside = (actor: { x: number; y: number }) =>
    actor.x >= area.x &&
    actor.x <= area.x + area.width &&
    actor.y >= area.y &&
    actor.y <= area.y + area.height;

  it("spawns the requested number of each role inside its area", () => {
    const actors = spawnActors([
      { role: "flock", area, count: 4 },
      { role: "grazer", area, count: 2 },
    ]);
    expect(actors.filter((actor) => actor.role === "flock")).toHaveLength(4);
    expect(actors.every(inside)).toBe(true);
  });

  it("wanders around but never leaves its area", () => {
    let [actor] = spawnActors([{ role: "companion", area, count: 1 }]);
    const visited = new Set<string>();
    for (let frame = 0; frame < 2000; frame++) {
      actor = stepActor(actor!, 1 / 30);
      expect(inside(actor)).toBe(true);
      visited.add(`${Math.round(actor.x / 10)},${Math.round(actor.y / 10)}`);
    }
    expect(visited.size).toBeGreaterThan(3);
  });
});

describe("river and bridge", () => {
  const town = buildTownWorld({ sections: [{ id: "a", building: "residence" }], signs: [] });
  const ground = town.ground.type === "town" ? town.ground : undefined;
  const isBlocked = isBlockedIn(town);

  it("blocks the river except at the bridge", () => {
    const midRiver = ground!.river.y + ground!.river.height / 2;
    expect(isBlocked(feetBox({ x: 40, y: midRiver }))).toBe(true);
    expect(
      isBlocked(feetBox({ x: ground!.bridge.x + ground!.bridge.width / 2, y: midRiver })),
    ).toBe(false);
  });

  it("keeps scattered ground cover off the paths", () => {
    const cover = town.props.filter((prop) => prop.kind === "mushrooms" || prop.kind === "flowers");
    for (const prop of cover) {
      const centre = {
        x: prop.bounds.x + prop.bounds.width / 2,
        y: prop.bounds.y + prop.bounds.height / 2,
      };
      for (const path of ground!.paths)
        expect(distanceToSegment(centre, path)).toBeGreaterThan(path.width / 2);
    }
  });
});
