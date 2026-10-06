import test from "node:test";
import assert from "node:assert/strict";
import { paintGround } from "../dist/ground.js";
function render(seed) {
  const commands = [];
  const p = {};
  for (const method of ["rect", "ellipse", "path"])
    p[method] = (...args) => commands.push([method, ...args]);
  paintGround(p, { x: 0, y: 0, width: 160, height: 120 }, seed);
  return commands;
}
test("Voronoi terrain remains deterministic with varied regions", () => {
  assert.deepEqual(render(10), render(10));
  assert.notDeepEqual(render(10), render(11));
  assert.ok(new Set(render(10).map((c) => c.at(-1))).size >= 4);
});
