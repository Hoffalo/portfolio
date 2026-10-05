import test from "node:test";
import assert from "node:assert/strict";
import {
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
  assert.equal(c.x, 486);
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
    [0, 0.125, 0.25, 0.375].map((t) => walkFrame(t, true, false)),
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
