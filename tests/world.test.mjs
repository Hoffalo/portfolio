import test from "node:test";
import assert from "node:assert/strict";
import {
  World,
  villageTrees,
  treeClearsRiver,
  cabinPaths,
  treeClearsCabinPaths,
  foxState,
  rabbitState,
  WALK_SPEED,
  walkFrame,
  canWalk,
  movePlayer,
  nearbyArea,
  destinations,
} from "../dist/world.js";
import { areas } from "../dist/content.js";
test("every portfolio area has a walkable entrance and matching content", () => {
  assert.equal(destinations.length, 4);
  for (const d of destinations) {
    assert.ok(areas[d.id]);
    assert.ok(canWalk(d.doorX, d.doorY));
    assert.equal(nearbyArea(d.doorX, d.doorY), d.id);
  }
});
test("buildings, stream and world boundaries block movement", () => {
  assert.equal(canWalk(0, 300), false);
  assert.equal(canWalk(480, 190), false);
  for (const d of destinations)
    assert.equal(canWalk(d.x + 30, d.y + 50), false);
  assert.equal(canWalk(482, 355), true);
});
test("diagonal movement uses equal speed and frame spikes are capped", () => {
  const a = { x: 482, y: 355 },
    b = { ...a };
  movePlayer(a, 1, 0, 0.02);
  movePlayer(b, 1, 1, 0.02);
  assert.ok(Math.abs(Math.hypot(b.x - 482, b.y - 355) - (a.x - 482)) < 1e-6);
  const c = { x: 482, y: 355 };
  movePlayer(c, 1, 0, 20);
  assert.ok(Math.abs(c.x - (482 + WALK_SPEED * 0.04)) < 1e-6);
  assert.ok(Math.abs(a.x - (482 + 184 * 0.02)) < 1e-6);
});
test("all entrances are reachable from spawn through collision map", () => {
  const grid = 4,
    queue = [[480, 356]],
    seen = new Set(["480,356"]);
  for (let i = 0; i < queue.length; i++) {
    const [x, y] = queue[i];
    for (const [dx, dy] of [
      [grid, 0],
      [-grid, 0],
      [0, grid],
      [0, -grid],
    ]) {
      const nx = x + dx,
        ny = y + dy,
        key = `${nx},${ny}`;
      if (!seen.has(key) && canWalk(nx, ny)) {
        seen.add(key);
        queue.push([nx, ny]);
      }
    }
  }
  for (const d of destinations)
    assert.ok(
      queue.some(([x, y]) => Math.hypot(x - d.doorX, y - d.doorY) < 12),
      `${d.id} must be reachable`,
    );
});

test("walking has four discrete frames and respects reduced motion", () => {
  assert.deepEqual(
    [0, 0.1, 0.2, 0.3].map((t) => walkFrame(t, true, false)),
    [0, 1, 2, 3],
  );
  assert.equal(walkFrame(0.375, false, false), 0);
  assert.equal(walkFrame(0.375, true, true), 0);
});
test("blocked movement does not trigger a walking animation", () => {
  const player = { x: 48, y: 300 };
  assert.equal(movePlayer(player, -1, 0, 0.03), false);
  assert.equal(player.x, 48);
});

test("both fox routes stay in reachable clearings and freeze under reduced motion", () => {
  for (let index = 0; index < 2; index++) {
    for (let time = 0; time < 40; time += 0.1) {
      const fox = foxState(time, index);
      assert.ok(canWalk(fox.x, fox.y));
      assert.ok(fox.frame >= 0 && fox.frame < 4);
    }
    assert.deepEqual(foxState(0, index, true), foxState(20, index, true));
    assert.notDeepEqual(foxState(0, index), foxState(1, index));
  }
});

test("scrollable scenery never expands the playable cabin clearing", () => {
  const world = Object.create(World.prototype);
  world.layout = { height: 6200, skyHeight: 400, mobile: true, sections: [] };
  for (const point of [
    [482, 540],
    [482, 1400],
    [100, 355],
    [900, 355],
    [482, 250],
  ])
    assert.equal(world.isWalkable(...point), false);
  assert.ok(world.isWalkable(482, 355));
  const player = { x: 482, y: 355 };
  for (let i = 0; i < 600; i++) movePlayer(player, 0, 1, 0.04);
  assert.ok(player.y <= 478);
});

test("capped-frame movement cannot skip a narrow obstacle", () => {
  const player = { x: 482, y: 355 };
  movePlayer(player, 1, 0, 0.04, (x) => x < 486 || x > 488);
  assert.ok(player.x < 486);
});

test("statue fountain blocks entry without trapping the player", () => {
  assert.equal(canWalk(482, 324), false);
  assert.equal(canWalk(482, 355), true);
  for (const point of [
    [446, 324],
    [518, 324],
    [482, 290],
    [482, 356],
  ])
    assert.ok(canWalk(...point));
  const player = { x: 482, y: 355 };
  for (let i = 0; i < 30; i++) movePlayer(player, 0, -1, 0.04);
  assert.ok(player.y >= 349);
});
test("rabbits lead foxes on reachable routes and freeze for reduced motion", () => {
  for (let i = 0; i < 2; i++) {
    for (let t = 0; t < 40; t += 0.1) {
      const rabbit = rabbitState(t, i);
      assert.ok(canWalk(rabbit.x, rabbit.y));
      assert.notDeepEqual(rabbit, foxState(t, i));
    }
    assert.deepEqual(rabbitState(0, i, true), rabbitState(10, i, true));
  }
});

test("a transient render error cannot stop the next animation frame", () => {
  const previousRAF = globalThis.requestAnimationFrame;
  const previousDocument = globalThis.document;
  const queued = [];
  globalThis.requestAnimationFrame = (callback) => queued.push(callback);
  globalThis.document = { hidden: false };
  try {
    let rendered = 0;
    const world = {
      last: 0,
      time: 0,
      visible: true,
      active: false,
      draw() {
        throw new Error("transient render failure");
      },
    };
    world.frame = World.prototype.frame.bind(world);
    assert.throws(() => world.frame(100), /transient render failure/);
    assert.equal(queued.length, 1);
    world.draw = () => rendered++;
    queued[0](116);
    assert.equal(rendered, 1);
    assert.equal(queued.length, 2);
  } finally {
    if (previousRAF === undefined) delete globalThis.requestAnimationFrame;
    else globalThis.requestAnimationFrame = previousRAF;
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});

test("every complete village tree stays out of the river", () => {
  assert.ok(villageTrees().length > 30);
  assert.ok(villageTrees().every(treeClearsRiver));
  assert.equal(treeClearsRiver({ x: 480, y: 180, s: 1, tone: 0.5 }), false);
  assert.deepEqual(villageTrees(), villageTrees());
});

test("a drawing exception restores every surface transform and context", () => {
  let depth = 0;
  const ctx = {
    save() {
      depth++;
    },
    restore() {
      depth--;
    },
    translate() {},
    beginPath() {},
    rect() {},
    clip() {},
    clearRect() {},
    drawImage() {},
  };
  const original = {};
  const world = {
    ctx: original,
    layout: { height: 540, skyHeight: 0, clearings: [] },
    viewport: { top: 0, bottom: 540 },
    time: 0,
    reduced: false,
    scene: {},
    skyClouds() {
      throw new Error("paint failure");
    },
  };
  assert.throws(
    () => World.prototype.drawSurface.call(world, { ctx, top: 0, height: 540 }),
    /paint failure/,
  );
  assert.equal(depth, 0);
  assert.equal(world.ctx, original);
});

test("moon remains centered in its fixed scene at every resolution", () => {
  const world = Object.create(World.prototype);
  for (const scale of [0.333, 0.75, 1.5]) {
    world.layout = {
      scale,
      mobile: scale < 1,
      moonArea: { y: 200, height: 90 },
    };
    assert.deepEqual(world.moonPosition(), { x: 480, y: 270, diameter: 118 });
  }
});

test("curved cabin paths keep complete tree canopies clear", () => {
  assert.ok(villageTrees().every(treeClearsCabinPaths));
  const paths = cabinPaths();
  assert.equal(paths.length, 4);
  for (const path of paths) {
    assert.equal(path.length, 33);
    const [a, b, c] = [path[0], path[16], path[32]];
    assert.ok(
      Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) >
        1,
    );
  }
});
