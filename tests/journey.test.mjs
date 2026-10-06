import test from "node:test";
import assert from "node:assert/strict";
import {
  animateJourney,
  journeyGeometry,
  driftGeometry,
  driftState,
  farmGeometry,
  chickenState,
  pigState,
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
  drift: { x: 0, y: 4700, width: 960, height: 360 },
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
    ["campfire", "relics", "farm", "river", "drift"],
  );
  assert.ok(
    !scenes.some((s) => ["pond", "pod", "cave", "sleepers"].includes(s.kind)),
  );
});
test("pickup loops continuously inside the dirt clearing and parks under reduced motion", () => {
  const { bounds } = driftGeometry(layout.drift);
  for (let t = 0; t < 9; t += 0.1) {
    const state = driftState(t);
    const repeat = driftState(t + 9);
    assert.ok(Math.abs(state.x - repeat.x) < 1e-8);
    assert.ok(Math.abs(state.y - repeat.y) < 1e-8);
    assert.ok(state.moving);
    assert.ok(state.x - 70 > bounds.left && state.x + 70 < bounds.right);
    assert.ok(layout.drift.y + state.y - 70 > bounds.top);
    assert.ok(layout.drift.y + state.y + 70 < bounds.bottom);
  }
  assert.deepEqual(driftState(0, true), driftState(30, true));
});
test("six running chickens keep separate routes within the fenced pasture", () => {
  assert.equal(farmGeometry(layout.stable).cows.length, 6);
  for (let i = 0; i < 6; i++) {
    assert.notDeepEqual(chickenState(0, false, i), chickenState(2, false, i));
    assert.deepEqual(chickenState(0, true, i), chickenState(20, true, i));
  }
  for (let t = 0; t < 30; t += 0.2) {
    const chickens = Array.from({ length: 6 }, (_, i) =>
      chickenState(t, false, i),
    );
    chickens.forEach((state, i) => {
      assert.ok(state.x > 30 && state.x < 940);
      assert.ok(state.y > 190 && state.y < 340);
      chickens
        .slice(i + 1)
        .forEach((other) =>
          assert.ok(Math.hypot(state.x - other.x, state.y - other.y) > 30),
        );
    });
  }
});
test("wallowing pigs stay inside their mud pen and freeze under reduced motion", () => {
  for (let i = 0; i < 2; i++) {
    assert.deepEqual(pigState(0, true, i), pigState(30, true, i));
    assert.notDeepEqual(pigState(0, false, i), pigState(2, false, i));
    for (let t = 0; t < 30; t += 0.2) {
      const state = pigState(t, false, i);
      assert.ok(state.x - 45 > 70 && state.x + 45 < 330);
      assert.ok(state.y - 30 > 350 && state.y + 20 < 435);
      assert.ok(state.roll >= 0 && state.roll < 4);
    }
  }
});
test("tree exclusion tests canopies instead of just trunk centers", () => {
  const box = treeFootprint({ x: 300, y: 100, s: 1 });
  assert.ok(intersects(box, { left: 250, right: 350, top: 30, bottom: 50 }));
});
