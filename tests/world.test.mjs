import test from "node:test";
import assert from "node:assert/strict";
import {
  World,
  foxState,
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
  assert.ok(Math.abs(a.x - (482 + 160 * 0.02)) < 1e-6);
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
