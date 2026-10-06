import test from "node:test";
import assert from "node:assert/strict";
import {
  animateJourney,
  journeyGeometry,
  railwayGeometry,
  trainState,
  treeFootprint,
  intersects,
} from "../dist/journey.js";

const layout = {
  height: 7000,
  mobile: false,
  invitation: { x: 0, y: 1000, width: 960, height: 280 },
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
    ctx: {
      save() {},
      restore() {},
      translate() {},
      scale() {},
      beginPath() {},
      rect() {},
      clip() {},
    },
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

    { top: 4700, bottom: 5000 },
    { top: 5700, bottom: 6600 },
  ]) {
    assert.ok(render(0, false, viewport).length > 0);
    assert.notDeepEqual(
      render(15, false, viewport),
      render(25, false, viewport),
    );
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
  assert.deepEqual(
    scenes.map((s) => s.kind),
    ["campfire", "farm", "river", "railway"],
  );
  assert.ok(
    !scenes.some((s) => ["pond", "pod", "cave", "sleepers"].includes(s.kind)),
  );
});
test("straight rails align inside both tunnel mouths", () => {
  const { points, leftTunnel, rightTunnel } = railwayGeometry(layout.railway);
  assert.equal(points[0][1], points.at(-1)[1]);
  for (const tunnel of [leftTunnel, rightTunnel])
    assert.ok(
      points[0][1] > tunnel.mouthTop && points[0][1] < tunnel.mouthBottom,
    );
});
test("the train makes a complete pass, loops and parks under reduced motion", () => {
  assert.ok(trainState(10).moving);
  assert.ok(trainState(45).frontX > trainState(10).frontX);
  assert.deepEqual(trainState(25), trainState(89));
  assert.equal(trainState(55).moving, false);
  assert.deepEqual(trainState(0, true), trainState(30, true));
});
test("tree exclusion tests canopies instead of just trunk centers", () => {
  const box = treeFootprint({ x: 300, y: 100, s: 1 });
  assert.ok(intersects(box, { left: 250, right: 350, top: 30, bottom: 50 }));
});
