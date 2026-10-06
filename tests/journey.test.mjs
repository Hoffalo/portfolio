import test from "node:test";
import assert from "node:assert/strict";
import {
  animateJourney,
  journeyGeometry,
  railwayGeometry,
  treeFootprint,
  intersects,
} from "../dist/journey.js";

const layout = {
  height: 7000,
  mobile: false,
  clearings: [
    { id: "about", y: 1000, height: 400 },
    { id: "projects", y: 2200, height: 320 },
    { id: "career", y: 3400, height: 340 },
    { id: "gamedev", y: 4300, height: 280 },
  ],
  sections: [
    { id: "about", x: 86, y: 1000, width: 557, height: 900 },
    { id: "projects", x: 317, y: 2200, width: 557, height: 900 },
    { id: "career", x: 86, y: 3400, width: 557, height: 900 },
  ],
  divider: { x: 0, y: 650, width: 960, height: 200 },
  railway: { x: 0, y: 4700, width: 960, height: 300 },
  stable: { x: 0, y: 5700, width: 960, height: 900 },
};
function render(time, reduced, viewport) {
  const draws = [];
  const painter = {
    time,
    reduced,
    viewport,
    ctx: { save() {}, restore() {}, translate() {}, scale() {} },
  };
  for (const method of ["rect", "ellipse", "path", "lantern"])
    painter[method] = (...args) =>
      draws.push([method, painter.ctx.globalAlpha ?? 1, ...args]);
  animateJourney(painter, layout);
  return draws;
}
test("each visible scene changes with the animation clock", () => {
  for (const viewport of [
    { top: 600, bottom: 850 },
    { top: 900, bottom: 2000 },
    { top: 2200, bottom: 2900 },
    { top: 3400, bottom: 4100 },
    { top: 4700, bottom: 5000 },
    { top: 5700, bottom: 6600 },
  ]) {
    assert.ok(render(0, false, viewport).length > 0);
    assert.notDeepEqual(render(0, false, viewport), render(2, false, viewport));
  }
});
test("reduced motion freezes lower scenery, farm animals and river", () => {
  assert.deepEqual(render(0, true), render(20, true));
});
test("offscreen scenery has no animated draw calls", () => {
  assert.deepEqual(render(2, false, { top: 0, bottom: 500 }), []);
});

test("fixed scene compositions are identical at every resolution", () => {
  assert.deepEqual(
    journeyGeometry({ ...layout, mobile: true }),
    journeyGeometry({ ...layout, mobile: false }),
  );
  const scenes = journeyGeometry(layout);
  const camp = scenes.find((s) => s.kind === "campfire"),
    pond = scenes.find((s) => s.kind === "pond");
  assert.ok(camp.x + camp.rx + 16 < pond.x - pond.rx);
});
test("railway curves into the tunnel opening instead of crossing masonry", () => {
  const { points, tunnel } = railwayGeometry(layout.railway),
    end = points.at(-1);
  assert.ok(end[0] > tunnel.mouthLeft && end[0] < tunnel.mouthRight);
  assert.ok(end[1] > tunnel.mouthTop && end[1] < tunnel.mouthBottom);
  assert.ok(new Set(points.map((p) => p[1])).size > 3);
});
test("tree exclusion tests canopies instead of just trunk centers", () => {
  const box = treeFootprint({ x: 300, y: 100, s: 1 });
  assert.ok(intersects(box, { left: 250, right: 350, top: 30, bottom: 50 }));
});
