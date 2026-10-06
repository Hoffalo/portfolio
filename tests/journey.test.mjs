import test from "node:test";
import assert from "node:assert/strict";
import { animateJourney } from "../dist/journey.js";

const layout = {
  height: 7000,
  mobile: false,
  sections: [
    { id: "about", x: 86, y: 1000, width: 557, height: 900 },
    { id: "projects", x: 317, y: 2200, width: 557, height: 900 },
    { id: "career", x: 86, y: 3400, width: 557, height: 900 },
  ],
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
    painter[method] = (...args) => draws.push([method, ...args]);
  animateJourney(painter, layout);
  return draws;
}
test("each visible scene changes with the animation clock", () => {
  for (const viewport of [
    { top: 900, bottom: 2000 },
    { top: 2200, bottom: 2900 },
    { top: 3400, bottom: 4100 },
    { top: 5700, bottom: 6600 },
  ]) {
    assert.ok(render(0, false, viewport).length > 0);
    assert.notDeepEqual(render(0, false, viewport), render(2, false, viewport));
  }
});
test("reduced motion freezes campfire, pond, house, bear and horses", () => {
  assert.deepEqual(render(0, true), render(20, true));
});
test("offscreen scenery has no animated draw calls", () => {
  assert.deepEqual(render(2, false, { top: 0, bottom: 500 }), []);
});
