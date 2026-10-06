import test from "node:test";
import assert from "node:assert/strict";
import { animateJourney, journeyGeometry } from "../dist/journey.js";

const layout = {
  height: 7000,
  mobile: false,
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

test("pond and campfire never overlap even beside a short reading section", () => {
  for (const height of [220, 320, 500, 900]) {
    const scenes = journeyGeometry({
      ...layout,
      sections: [{ id: "about", x: 86, y: 1000, width: 557, height }],
    });
    const camp = scenes.find((s) => s.kind === "campfire");
    const pond = scenes.find((s) => s.kind === "pond");
    assert.ok(camp.y + camp.ry + 16 <= pond.y - pond.ry);
  }
});
