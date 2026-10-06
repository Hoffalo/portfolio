import { paintJourney } from "./journey.js";
export const WIDTH = 960,
  HEIGHT = 540;
export const destinations = [
  {
    id: "projects",
    x: 245,
    y: 179,
    w: 137,
    h: 103,
    doorX: 312,
    doorY: 289,
    label: "THE WORKSHOP",
    sub: "PROJECTS",
    color: "#bdac78",
  },
  {
    id: "career",
    x: 627,
    y: 146,
    w: 116,
    h: 139,
    doorX: 687,
    doorY: 291,
    label: "THE OBSERVATORY",
    sub: "CAREER",
    color: "#a9bec3",
  },
  {
    id: "gamedev",
    x: 188,
    y: 339,
    w: 122,
    h: 89,
    doorX: 251,
    doorY: 435,
    label: "THE ARCADE",
    sub: "GAME DEV",
    color: "#b99ba7",
  },
  {
    id: "about",
    x: 648,
    y: 350,
    w: 133,
    h: 84,
    doorX: 714,
    doorY: 440,
    label: "THE CABIN",
    sub: "ABOUT ME",
    color: "#c5a977",
  },
];
export function canWalk(x, y) {
  if (x < 158 || x > 818 || y < 274 || y > 478) return false;
  if (x > 430 && x < 521 && y < 280) return false;
  // The fountain is solid; the four paths remain open around its basin.
  if (Math.hypot((x - 482) / 1.15, y - 324) < 25) return false;
  return !destinations.some(
    (d) =>
      x > d.x - 9 && x < d.x + d.w + 9 && y > d.y + 18 && y < d.y + d.h + 3,
  );
}
export function nearbyArea(x, y) {
  return (
    destinations.find((d) => Math.hypot(x - d.doorX, y - d.doorY) < 48)?.id ||
    null
  );
}
export const WALK_SPEED = 160;
export function movePlayer(player, dx, dy, dt, walkable = canWalk) {
  const length = Math.hypot(dx, dy);
  if (!length) return false;
  const amount = WALK_SPEED * Math.min(dt, 0.04);
  const previousX = player.x,
    previousY = player.y;
  // Small collision steps preserve passage through tight bends at lower frame rates.
  const steps = Math.max(1, Math.ceil(amount / 2));
  for (let step = 0; step < steps; step++) {
    const x = player.x + ((dx / length) * amount) / steps,
      y = player.y + ((dy / length) * amount) / steps;
    if (walkable(x, player.y)) player.x = x;
    if (walkable(player.x, y)) player.y = y;
  }
  player.facing = dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down";
  return player.x !== previousX || player.y !== previousY;
}
export function walkFrame(time, moving, reduced) {
  return moving && !reduced ? Math.floor(time * 10) % 4 : 0;
}
const FOX_ROUTES = [
  [
    [334, 375],
    [393, 355],
    [427, 398],
    [355, 433],
    [332, 409],
  ],
  [
    [566, 380],
    [621, 334],
    [629, 393],
    [604, 424],
    [553, 410],
  ],
];
export function foxState(time, index, reduced = false, lead = 0) {
  const route = FOX_ROUTES[index];
  const lengths = route.map((point, i) =>
    Math.hypot(
      point[0] - route[(i + 1) % route.length][0],
      point[1] - route[(i + 1) % route.length][1],
    ),
  );
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let distance =
    ((reduced ? 0 : time) * (index ? 32 : 38) + index * 79 + lead) % total;
  let segment = 0;
  while (distance > lengths[segment]) distance -= lengths[segment++];
  const start = route[segment],
    end = route[(segment + 1) % route.length],
    t = distance / lengths[segment];
  return {
    x: start[0] + (end[0] - start[0]) * t,
    y: start[1] + (end[1] - start[1]) * t,
    facing: end[0] >= start[0] ? 1 : -1,
    frame: reduced ? 0 : Math.floor(time * 10 + index) % 4,
  };
}
// A rabbit stays ahead of each fox on the same loop, including at corners.
export function rabbitState(time, index, reduced = false) {
  return foxState(time, index, reduced, 58);
}
function seeded(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
export class World {
  constructor(canvas, onNear) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.scale(0.5, 0.5);
    this.player = { x: 482, y: 355, facing: "down" };
    this.keys = new Set();
    this.onNear = onNear;
    this.near = null;
    this.active = true;
    this.visible = true;
    this.layout = {
      height: HEIGHT,
      skyHeight: 0,
      moonY: 55,
      sections: [],
      mobile: false,
    };
    this.gameVisible = true;
    this.viewport = { top: 0, bottom: HEIGHT };
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.time = 0;
    this.last = 0;
    this.walking = false;
    this.walkTime = 0;
    const rand = seeded(827);
    this.grass = Array.from({ length: 1400 }, () => ({
      x: rand() * 960,
      y: 110 + rand() * 430,
      v: rand(),
    }));
    this.trees = [];
    for (let row = 0; row < 6; row++)
      for (let col = 0; col < 24; col++) {
        const x = col * 45 + (rand() - 0.5) * 22,
          y = 85 + row * 71 + (rand() - 0.5) * 27;
        const size = 0.65 + rand() * 0.5,
          tone = rand();
        // Leave a break in the treeline so the moon can light the clearing.
        const moonOpening = x > 754 && x < 904 && y < 157;
        if (
          !moonOpening &&
          (y < 150 || x < 150 || x > 818 || (x > 384 && x < 577 && y < 235))
        )
          this.trees.push({ x, y, s: size, tone });
      }
    // Frame the southern edge without closing the central entrance path.
    this.trees.push(
      ...[
        { x: 82, y: 534, s: 1.02, tone: 0.65 },
        { x: 158, y: 552, s: 1.15, tone: 0.22 },
        { x: 231, y: 552, s: 0.96, tone: 0.71 },
        { x: 304, y: 542, s: 0.93, tone: 0.34 },
        { x: 372, y: 556, s: 1.05, tone: 0.18 },
        { x: 604, y: 556, s: 1.0, tone: 0.62 },
        { x: 676, y: 554, s: 1.08, tone: 0.3 },
        { x: 749, y: 556, s: 0.98, tone: 0.76 },
        { x: 832, y: 550, s: 1.15, tone: 0.21 },
        { x: 918, y: 538, s: 1.02, tone: 0.58 },
      ],
    );
    this.rain = Array.from({ length: 54 }, () => ({
      x: rand() * 960,
      y: rand() * 540,
      s: 65 + rand() * 35,
    }));
    this.clouds = [
      { x: 100, y: 16, w: 170, h: 24, speed: 2.0 },
      { x: 410, y: 30, w: 200, h: 26, speed: 1.2 },
      { x: 715, y: 18, w: 140, h: 22, speed: 1.7 },
      { x: 872, y: 72, w: 170, h: 24, speed: 1.0 },
    ];
    this.flies = Array.from({ length: 15 }, () => ({
      x: 145 + rand() * 680,
      y: 240 + rand() * 255,
      phase: rand() * 7,
    }));
    this.scene = document.createElement("canvas");
    this.scene.width = WIDTH / 2;
    this.scene.height = HEIGHT / 2;
    const main = this.ctx;
    this.ctx = this.scene.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.scale(0.5, 0.5);
    this.drawTerrain();
    this.ctx = main;
    this.frame = this.frame.bind(this);
    requestAnimationFrame(this.frame);
  }
  setLayout(layout) {
    this.layout = layout;
    this.canvas.width = WIDTH / 2;
    this.canvas.height = Math.ceil(layout.height / 2);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.scale(0.5, 0.5);
    this.scene.width = WIDTH / 2;
    this.scene.height = this.canvas.height;
    const main = this.ctx,
      reduced = this.reduced,
      time = this.time;
    this.ctx = this.scene.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.scale(0.5, 0.5);
    this.reduced = true;
    this.time = 0;
    this.drawSky();
    this.ctx.save();
    this.ctx.translate(0, layout.skyHeight);
    this.drawTerrain();
    this.ctx.restore();
    paintJourney(this, layout);
    this.ctx = main;
    this.reduced = reduced;
    this.time = time;
    this.ctx.drawImage(this.scene, 0, 0, WIDTH, layout.height);
    if (!canWalk(this.player.x, this.player.y))
      this.player = { x: 482, y: 355, facing: "down" };
  }
  isWalkable(x, y) {
    return canWalk(x, y);
  }
  moonPosition() {
    return {
      x: this.layout.mobile ? 800 : this.layout.tablet ? 500 : 610,
      y: this.layout.moonY ?? 55,
      diameter: this.layout.mobile ? 160 : 118,
    };
  }
  drawSky() {
    this.rect(0, 0, WIDTH, this.layout.skyHeight || 0, "#17242b");
    const { x, y, diameter: d } = this.moonPosition();
    this.ellipse(x, y, d + 22, d + 22, "#253c40");
    this.ellipse(x, y, d + 10, d + 10, "#486360");
    this.ellipse(x, y, d, d, "#c6d3b5");
    this.ellipse(x - 2, y - 2, d - 6, d - 6, "#e5e4c7");
    this.ellipse(x - d * 0.23, y - d * 0.2, d * 0.19, d * 0.14, "#c6ceb4");
    this.ellipse(x + d * 0.22, y + d * 0.09, d * 0.23, d * 0.18, "#c9d0b9");
    this.ellipse(x - d * 0.03, y + d * 0.3, d * 0.13, d * 0.09, "#cbd2b8");
    const rand = seeded(714);
    for (let i = 0; i < 45; i++) {
      const sx = rand() * WIDTH,
        sy = rand() * this.layout.skyHeight;
      if (Math.hypot(sx - x, sy - y) > d * 0.7)
        this.rect(sx, sy, 2, 2, "#7d9693");
    }
    const base = this.layout.skyHeight + 8;
    for (const [mx, height, w] of [
      [-20, 68, 180],
      [162, 104, 230],
      [370, 70, 220],
      [598, 110, 240],
      [840, 76, 210],
      [1020, 112, 210],
    ]) {
      const peak = this.layout.mobile ? height : height * 0.5;
      this.path(
        [
          [mx - w / 2, base],
          [mx, base - peak],
          [mx + w / 2, base],
        ],
        "#344b50",
      );
      this.path(
        [
          [mx, base - peak],
          [mx + w / 2, base],
          [mx + 12, base - 20],
        ],
        "#263e45",
      );
      this.path(
        [
          [mx - w * 0.18, base - peak * 0.64],
          [mx, base - peak],
          [mx + w * 0.2, base - peak * 0.61],
          [mx + w * 0.07, base - peak * 0.72],
          [mx - 4, base - peak * 0.6],
          [mx - w * 0.06, base - peak * 0.76],
        ],
        "#b3c7c4",
      );
      this.path(
        [
          [mx, base - peak],
          [mx + w * 0.2, base - peak * 0.61],
          [mx + w * 0.07, base - peak * 0.72],
        ],
        "#769fa4",
      );
    }
  }
  // All art is drawn on a 480×270 framebuffer, with a two-unit pixel grid.
  rect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      Math.round(x / 2) * 2,
      Math.round(y / 2) * 2,
      Math.max(2, Math.round(w / 2) * 2),
      Math.max(2, Math.round(h / 2) * 2),
    );
  }
  path(points, color) {
    // Scanline rasterization keeps diagonals stepped instead of antialiased.
    const low = Math.floor(Math.min(...points.map((p) => p[1])) / 2) * 2;
    const high = Math.max(...points.map((p) => p[1]));
    for (let y = low; y < high; y += 2) {
      const intersections = [];
      for (let i = 0; i < points.length; i++) {
        const a = points[i],
          b = points[(i + 1) % points.length];
        if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y))
          intersections.push(
            a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]),
          );
      }
      intersections.sort((a, b) => a - b);
      for (let i = 0; i + 1 < intersections.length; i += 2)
        this.rect(
          intersections[i],
          y,
          intersections[i + 1] - intersections[i],
          2,
          color,
        );
    }
  }
  drawTerrain() {
    this.rect(0, 0, 960, 540, "#22332e");
    this.rect(0, 0, 960, 118, "#17242b");
    this.path(
      [
        [0, 124],
        [64, 86],
        [118, 104],
        [196, 57],
        [292, 112],
        [380, 73],
        [457, 115],
        [545, 62],
        [661, 115],
        [745, 69],
        [863, 113],
        [937, 79],
        [960, 110],
        [960, 165],
        [0, 165],
      ],
      "#253b3b",
    );
    this.path(
      [
        [0, 151],
        [78, 112],
        [180, 150],
        [271, 99],
        [386, 145],
        [508, 108],
        [630, 152],
        [735, 109],
        [851, 154],
        [960, 115],
        [960, 191],
        [0, 191],
      ],
      "#2b4240",
    );
    for (const [x, y] of [
      [196, 57],
      [380, 73],
      [545, 62],
      [745, 69],
      [937, 79],
    ]) {
      this.path(
        [
          [x - 30, y + 26],
          [x, y],
          [x + 33, y + 28],
          [x + 13, y + 20],
          [x + 3, y + 30],
          [x - 8, y + 18],
        ],
        "#a6bfbd",
      );
      this.rect(x - 4, y + 8, 6, 4, "#d0d8ce");
    }
    [
      [79, 35],
      [191, 22],
      [335, 45],
      [555, 23],
      [718, 40],
      [887, 25],
    ].forEach(([x, y]) => this.rect(x, y, 2, 2, "#7e9591"));
    const r = seeded(832);
    this.grass.forEach((g) => {
      if (g.y < 137) return;
      this.rect(g.x, g.y, 2 + g.v * 3, 2, g.v > 0.55 ? "#304438" : "#1c2c29");
      if (g.v > 0.78) {
        this.rect(g.x, g.y - 4, 2, 4, "#40503a");
        this.rect(g.x + 4, g.y - 2, 2, 4, "#354b37");
      }
    });
    // Mossy creek banks, with a clear walkable bridge further downstream.
    const creek = [
      [439, 121],
      [480, 121],
      [504, 170],
      [466, 210],
      [496, 259],
      [521, 298],
      [492, 329],
      [465, 315],
      [478, 263],
      [444, 225],
      [453, 182],
    ];
    this.path(creek, "#3e5147");
    this.path(
      [
        [450, 120],
        [475, 121],
        [490, 170],
        [452, 209],
        [484, 260],
        [507, 298],
        [487, 315],
        [477, 305],
        [490, 266],
        [436, 222],
        [467, 170],
      ],
      "#314e54",
    );
    for (let y = 142; y < 279; y += 18) {
      this.rect(450 + Math.sin(y) * 9, y, 18, 2, "#456864");
      this.rect(479 + Math.cos(y) * 5, y + 8, 9, 2, "#233e47");
    }
    // Four separate spokes connect the fountain courtyard to the cabin doors.
    const paths = [
      [
        [312, 287],
        [374, 307],
        [446, 324],
      ],
      [
        [687, 289],
        [605, 307],
        [518, 324],
      ],
      [
        [251, 435],
        [350, 393],
        [461, 351],
      ],
      [
        [714, 440],
        [610, 397],
        [503, 351],
      ],
    ];
    for (const route of paths) {
      for (let i = 0; i < route.length - 1; i++) {
        const [ax, ay] = route[i],
          [bx, by] = route[i + 1];
        const angle = Math.atan2(by - ay, bx - ax);
        const nx = Math.sin(angle) * 12,
          ny = Math.cos(angle) * 12;
        this.path(
          [
            [ax - nx, ay + ny],
            [bx - nx, by + ny],
            [bx + nx, by - ny],
            [ax + nx, ay - ny],
          ],
          "#534e3c",
        );
        for (let t = 0; t < 1; t += 0.075) {
          const x = ax + (bx - ax) * t,
            y = ay + (by - ay) * t;
          this.ellipse(x, y, 27, 20, "#847352");
          this.rect(x - 5 + r() * 8, y - 4, 6, 2, "#b09a6b");
          this.rect(x - 10, y + 4, 4, 2, "#62583f");
        }
      }
    }
    this.ellipse(482, 338, 92, 32, "#20352e");
    this.ellipse(482, 330, 86, 48, "#656c60");
    this.ellipse(482, 325, 80, 40, "#9aa18c");
    this.ellipse(482, 322, 66, 28, "#344f55");
    this.ellipse(482, 322, 58, 22, "#568b8b");
    for (let x = 448; x <= 516; x += 12) {
      this.rect(x, 329, 2, 8, "#454f48");
      this.rect(x + 2, 336, 8, 2, "#869281");
    }
    // A moonlit stone owl on a tiered pedestal watches over the village.
    this.ellipse(482, 321, 24, 10, "#a7ae98");
    this.rect(476, 295, 12, 26, "#7a897d");
    this.rect(478, 296, 4, 22, "#a5b5a0");
    this.rect(470, 291, 24, 6, "#b5bfaa");
    this.ellipse(482, 279, 23, 25, "#849689");
    this.rect(471, 264, 6, 10, "#a3b5a4");
    this.rect(489, 264, 6, 10, "#a3b5a4");
    this.ellipse(477, 274, 8, 8, "#cbd0b8");
    this.ellipse(487, 274, 8, 8, "#cbd0b8");
    this.rect(476, 274, 2, 2, "#3b514d");
    this.rect(486, 274, 2, 2, "#3b514d");
    this.path(
      [
        [480, 277],
        [484, 277],
        [482, 282],
      ],
      "#c4b58a",
    );
    this.rect(478, 285, 8, 2, "#c0c9b3");
    this.waterfalls();
    // Tiny garden by the cabin: squash, flowers, and a crooked fence.
    this.rect(790, 384, 48, 62, "#182b28");
    for (let y = 392; y < 443; y += 16)
      for (let x = 797; x < 833; x += 14) {
        this.rect(x - 3, y, 12, 10, "#554b36");
        this.rect(x + 2, y - 3, 3, 6, "#68804a");
        this.rect(x - 1, y + 1, 8, 6, "#a47643");
        this.rect(x + 2, y + 1, 2, 5, "#c3944b");
      }
    for (let x = 785; x < 841; x += 14) {
      this.rect(x, 446, 3, 13, "#7a704b");
      this.rect(x, 448, 14, 3, "#98815b");
    }
    // Flowers, pebbles and clusters of mushrooms.
    for (let i = 0; i < 95; i++) {
      const x = 160 + r() * 670,
        y = 165 + r() * 337;
      if (!canWalk(x, y) || nearbyArea(x, y) || Math.abs(x - 482) < 33)
        continue;
      if (i % 4 === 0) {
        this.rect(x, y, 3, 6, "#778056");
        this.rect(x - 3, y - 2, 9, 4, "#a36452");
        this.rect(x, y - 2, 3, 2, "#ce9b77");
      } else if (i % 3 === 0) {
        this.rect(x, y, 2, 6, "#67794d");
        this.rect(x - 2, y - 2, 6, 4, "#b0aa79");
      } else {
        this.rect(x, y, 8, 4, "#53604e");
        this.rect(x + 2, y - 2, 5, 2, "#72806a");
      }
    }
    for (let x = 327; x < 420; x += 20) {
      this.rect(x, 461, 4, 20, "#82714e");
      this.rect(x, 464, 20, 3, "#a28a5f");
      this.rect(x, 474, 20, 3, "#5d583b");
    }
    this.rect(564, 453, 45, 6, "#a28a5e");
    this.rect(566, 444, 41, 7, "#786a4c");
    this.rect(568, 459, 4, 10, "#5c573e");
    this.rect(602, 459, 4, 10, "#5c573e");
    // A stone-ringed campfire in the clearing.
    this.rect(562, 342, 26, 6, "#1b2b27");
    this.rect(558, 336, 7, 7, "#71806b");
    this.rect(585, 337, 7, 7, "#71806b");
    this.rect(565, 347, 21, 4, "#586553");
    this.rect(563, 339, 22, 4, "#6c4d35");
    this.rect(568, 336, 5, 11, "#94704a");
  }
  ellipse(x, y, w, h, color) {
    for (let yy = -h / 2; yy <= h / 2; yy += 2) {
      const span = (w / 2) * Math.sqrt(Math.max(0, 1 - (yy / (h / 2)) ** 2));
      this.rect(x - span, y + yy, span * 2, 2, color);
    }
  }
  tree(t) {
    const x = Math.round(t.x / 2) * 2,
      y = Math.round(t.y / 2) * 2;
    const s = t.s,
      width = Math.round((34 * s) / 2) * 2,
      height = Math.round((68 * s) / 2) * 2;
    this.ellipse(x, y + 2, width * 1.7, 12, "#192a24");
    this.rect(x - 6, y - 29, 12, 33, "#403c2c");
    this.rect(x - 3, y - 27, 4, 30, "#786445");
    this.rect(x - 9, y - 3, 5, 7, "#514c33");
    this.rect(x + 5, y - 5, 5, 9, "#514c33");
    this.ctx.save();
    const sway = this.reduced
      ? 0
      : Math.round(Math.sin(this.time * 0.8 + t.x * 0.017) * 1.2) * 2;
    this.ctx.translate(sway, 0);
    const dark = t.tone > 0.5 ? "#1e322b" : "#1c332f",
      mid = t.tone > 0.5 ? "#334b36" : "#2c4b3b",
      light = t.tone > 0.5 ? "#526644" : "#47644a";
    if (t.tone < 0.28) {
      // Pines mix with softer broadleaf trees around the clearing.
      this.path(
        [
          [x, y - height - 18],
          [x - 12 * s, y - height + 4],
          [x - 7 * s, y - height + 4],
          [x - 26 * s, y - 38 * s],
          [x - 18 * s, y - 38 * s],
          [x - 37 * s, y - 9],
          [x + 37 * s, y - 9],
          [x + 18 * s, y - 38 * s],
          [x + 26 * s, y - 38 * s],
          [x + 7 * s, y - height + 4],
          [x + 12 * s, y - height + 4],
        ],
        dark,
      );
      this.path(
        [
          [x, y - height - 13],
          [x - 9 * s, y - height + 5],
          [x - 5 * s, y - height + 5],
          [x - 21 * s, y - 37 * s],
          [x - 14 * s, y - 37 * s],
          [x - 31 * s, y - 13],
          [x - 1, y - 13],
        ],
        mid,
      );
      this.rect(x - 13 * s, y - 41 * s, 10 * s, 3, light);
      this.rect(x - 22 * s, y - 20, 16 * s, 3, light);
    } else {
      // Overlapping rasterized leaf clusters produce irregular, rounded crowns.
      this.ellipse(x, y - height * 0.7, width * 2.15, height * 0.9, dark);
      this.ellipse(
        x - width * 0.42,
        y - height * 0.66,
        width * 1.5,
        height * 0.66,
        dark,
      );
      this.ellipse(
        x + width * 0.43,
        y - height * 0.61,
        width * 1.5,
        height * 0.65,
        dark,
      );
      this.ellipse(x - 3, y - height * 0.84, width * 1.6, height * 0.56, mid);
      this.ellipse(
        x - width * 0.42,
        y - height * 0.61,
        width * 1.22,
        height * 0.58,
        mid,
      );
      this.ellipse(
        x + width * 0.32,
        y - height * 0.6,
        width * 1.25,
        height * 0.53,
        mid,
      );
      const r = seeded(Math.round(t.x * 47 + t.y));
      for (let i = 0; i < 32; i++) {
        const lx = (r() - 0.5) * width * 1.8,
          ly = (r() - 0.5) * height * 0.7;
        if ((lx / (width * 0.95)) ** 2 + (ly / (height * 0.4)) ** 2 < 1)
          this.rect(
            x + lx,
            y - height * 0.72 + ly,
            4 + r() * 4,
            2 + r() * 2,
            i % 3 === 0 ? light : dark,
          );
      }
      this.rect(x - width * 0.4, y - height * 0.94, width * 0.4, 3, light);
      this.rect(x - width * 0.75, y - height * 0.7, width * 0.3, 3, light);
    }
    this.ctx.restore();
  }
  glow(x, y, size, color = "#e0ac53") {
    // Three stepped pools of light instead of a smooth modern gradient.
    const c = this.ctx;
    c.save();
    [
      [size, 0.025],
      [size * 0.65, 0.04],
      [size * 0.35, 0.08],
    ].forEach(([s, alpha]) => {
      c.globalAlpha =
        alpha * (this.reduced ? 1 : 0.93 + Math.sin(this.time * 4 + x) * 0.07);
      this.rect(x - s, y - s * 0.45, s * 2, s * 0.9, color);
      this.rect(x - s * 0.7, y - s * 0.65, s * 1.4, s * 1.3, color);
    });
    c.restore();
  }
  building(d) {
    const { x, y, w, h, id } = d;
    this.rect(x - 6, y + h - 2, w + 12, 14, "#182622");
    this.rect(x - 2, y + 28, w + 4, h - 24, "#302d28");
    this.rect(x + 3, y + 31, w - 6, h - 30, "#79664b");
    for (let yy = y + 37; yy < y + h; yy += 9) {
      this.rect(x + 3, yy, w - 6, 2, "#4e4935");
      this.rect(x + 5, yy + 2, w - 10, 2, "#8e7652");
    }
    [x + 4, x + w - 10].forEach((xx) =>
      this.rect(xx, y + 31, 6, h - 31, "#4a4030"),
    );
    if (id === "career") {
      this.rect(x + 22, y - 34, w - 43, 66, "#69644e");
      for (let yy = y - 29; yy < y + 32; yy += 10)
        this.rect(x + 24, yy, w - 48, 2, "#454a3c");
      this.path(
        [
          [x + 13, y - 25],
          [x + 30, y - 49],
          [x + w - 29, y - 49],
          [x + w - 10, y - 25],
        ],
        "#59646a",
      );
      this.rect(x + 28, y - 35, w - 55, 10, "#74837d");
      this.rect(x + 46, y - 45, 6, 25, "#949582");
      this.rect(x + w - 4, y - 35, 4, 32, "#818d7c");
      this.rect(x + w - 2, y - 40, 20, 8, "#a1a895");
    } else {
      this.rect(x + w - 34, y - 18, 17, 37, "#565447");
      this.rect(x + w - 36, y - 20, 21, 5, "#7d7560");
    }
    const roof =
      id === "gamedev" ? "#765668" : id === "about" ? "#785b4e" : "#5a6460";
    const shade =
      id === "gamedev" ? "#4c3c4b" : id === "about" ? "#4d413a" : "#3c4a46";
    this.path(
      [
        [x - 14, y + 34],
        [x + w / 2, y - 14],
        [x + w + 14, y + 34],
        [x + w + 14, y + 43],
        [x - 14, y + 43],
      ],
      shade,
    );
    this.path(
      [
        [x - 10, y + 31],
        [x + w / 2, y - 9],
        [x + w + 10, y + 31],
      ],
      roof,
    );
    // Individual roof shingles and a bright timber eave.
    for (let row = 0; row < 6; row++) {
      const yy = y - 3 + row * 7,
        half = (yy - y + 13) * 1.65;
      this.rect(x + w / 2 - half, yy, half * 2, 2, shade);
      for (let xx = x + w / 2 - half + 5; xx < x + w / 2 + half - 4; xx += 16)
        this.rect(xx + (row % 2 ? 4 : 0), yy + 2, 2, 4, shade);
    }
    this.rect(x - 13, y + 37, w + 26, 5, "#a18a5c");
    this.rect(x - 9, y + 42, w + 18, 3, "#493f2f");
    const doorY = y + h - 42;
    this.rect(d.doorX - 13, doorY, 26, 42, "#30362c");
    this.rect(d.doorX - 10, doorY + 4, 20, 38, "#a17c47");
    for (let xx = d.doorX - 8; xx < d.doorX + 9; xx += 6)
      this.rect(xx, doorY + 6, 2, 34, "#765b39");
    this.rect(d.doorX - 7, doorY + 7, 14, 15, "#e2b765");
    this.rect(d.doorX - 1, doorY + 7, 2, 15, "#877047");
    this.rect(d.doorX + 5, doorY + 29, 3, 3, "#ecc981");
    this.rect(d.doorX - 17, y + h, 34, 5, "#ad9a6b");
    this.rect(d.doorX - 22, y + h + 5, 44, 4, "#6c7354");
    [x + 16, x + w - 39].forEach((wx) => {
      this.rect(wx - 3, y + h - 50, 28, 31, "#39392c");
      this.rect(wx, y + h - 47, 22, 25, "#d3a24e");
      this.rect(wx + 3, y + h - 44, 16, 19, "#f0cc78");
      this.rect(wx + 9, y + h - 47, 3, 25, "#806242");
      this.rect(wx, y + h - 35, 22, 3, "#806242");
      this.rect(wx - 5, y + h - 21, 32, 5, "#a48a5b");
      this.rect(wx - 6, y + h - 49, 3, 25, "#5b6042");
      this.rect(wx + 26, y + h - 49, 3, 25, "#5b6042");
      this.glow(wx + 11, y + h - 34, 58);
    });
    if (id === "projects") {
      this.rect(x - 23, y + h - 20, 18, 21, "#80663e");
      this.rect(x - 21, y + h - 17, 14, 3, "#c19958");
      this.rect(x - 21, y + h - 6, 14, 3, "#493c2a");
      this.rect(x + w + 7, y + h - 19, 18, 22, "#5f5339");
      this.rect(x + w + 10, y + h - 15, 12, 3, "#a88850");
    }
    if (id === "gamedev") {
      this.rect(x + 35, y + 46, 52, 15, "#382f3b");
      this.rect(x + 41, y + 51, 7, 6, "#e4ae79");
      this.rect(x + 54, y + 51, 7, 6, "#b794a3");
      this.rect(x + 68, y + 51, 7, 6, "#97a88a");
    }
    if (id === "about") {
      this.rect(x + w + 4, y + h - 6, 17, 6, "#85674e");
      this.rect(x + w + 8, y + h - 13, 4, 8, "#626f48");
      this.rect(x + w + 14, y + h - 17, 4, 11, "#708352");
      this.rect(x - 21, y + h - 14, 12, 16, "#735f45");
      this.rect(x - 24, y + h - 19, 18, 8, "#485e3e");
    }
  }
  lantern(x, y) {
    this.rect(x, y - 33, 4, 35, "#575843");
    this.rect(x - 8, y - 35, 14, 4, "#a58e57");
    this.rect(x - 8, y - 30, 8, 11, "#d4a553");
    this.rect(x - 6, y - 28, 4, 7, "#f3d285");
    this.rect(x - 10, y - 33, 12, 3, "#534b33");
    this.rect(x - 10, y - 20, 12, 3, "#534b33");
    this.glow(x - 4, y - 25, 68);
  }
  character() {
    const { x, y, facing } = this.player;
    const px = Math.round(x / 2) * 2,
      py = Math.round(y / 2) * 2;
    const frame = walkFrame(this.walkTime, this.walking, this.reduced);
    const stride = [0, 3, 0, -3][frame],
      bob = frame % 2 ? 2 : 0;
    const side = facing === "left" || facing === "right",
      direction = facing === "left" ? -1 : 1;
    this.ellipse(px, py + 3, 24, 7, "#15271f");
    // Boots alternate independently; the arms counter-swing against the legs.
    this.rect(px - 8, py - 8 - stride, 6, 10, "#343732");
    this.rect(px - 9, py - stride, 8, 3, "#554835");
    this.rect(px + 2, py - 8 + stride, 6, 10, "#343732");
    this.rect(px + 2, py + stride, 8, 3, "#554835");
    const body = py - bob;
    this.rect(px - 11, body - 24, 22, 18, "#789880");
    this.rect(px - 9, body - 23, 5, 16, "#98aa86");
    this.rect(px - 13, body - 22 + stride, 4, 12, "#9dad89");
    this.rect(px - 13, body - 12 + stride, 4, 4, "#dcbb85");
    this.rect(px + 9, body - 22 - stride, 4, 12, "#6c876f");
    this.rect(px + 9, body - 12 - stride, 4, 4, "#c7a878");
    this.rect(px - 8, body - 40, 16, 17, "#dcbb85");
    this.rect(px - 10, body - 42, 20, 9, "#4b4034");
    this.rect(px - 8, body - 44, 14, 4, "#68533a");
    this.rect(px - 12, body - 37, 4, 12, "#4b4034");
    this.rect(px - 12, body - 26, 24, 5, "#b86650");
    const scarfWave = this.reduced
      ? 0
      : Math.round(Math.sin(this.time * 4)) * 2;
    this.rect(px + (facing === "left" ? 9 : -13), body - 23, 5, 12, "#91463e");
    this.rect(
      px + (facing === "left" ? 10 : -16),
      body - 14 + scarfWave,
      7,
      4,
      "#b86650",
    );
    if (facing === "up") {
      this.rect(px - 8, body - 34, 16, 8, "#4b4034");
      this.rect(px - 7, body - 19, 14, 12, "#526d58");
      this.rect(px - 5, body - 17, 10, 4, "#839174");
      this.rect(px - 6, body - 8, 12, 3, "#ab976c");
    } else {
      if (side) {
        this.rect(px + (direction < 0 ? -11 : 8), body - 33, 3, 6, "#dcbb85");
        this.rect(px + (direction < 0 ? -6 : 5), body - 32, 2, 3, "#32392c");
      } else {
        this.rect(px - 5, body - 32, 2, 3, "#32392c");
        this.rect(px + 3, body - 32, 2, 3, "#32392c");
      }
      this.rect(px - 3, body - 27, 6, 2, "#ad845a");
      this.rect(px - 5, body - 18, 10, 10, "#5d7865");
      this.rect(px - 3, body - 16, 6, 2, "#b2b18b");
    }
  }
  smoke(d) {
    if (d.id === "career") return;
    const x = d.x + d.w - 26,
      y = d.y - 23;
    for (let i = 0; i < 3; i++) {
      const phase = this.reduced ? i * 0.31 : (this.time * 0.11 + i * 0.31) % 1;
      const drift = this.reduced ? i * 3 : Math.sin(phase * 5 + d.x) * 7;
      this.ctx.globalAlpha = (1 - phase) * 0.21;
      this.rect(
        x + drift - 4,
        y - phase * 47,
        8 + phase * 12,
        6 + phase * 5,
        "#a2aaa0",
      );
    }
    this.ctx.globalAlpha = 1;
  }
  fire() {
    const frame = this.reduced ? 1 : Math.floor(this.time * 7) % 4;
    this.rect(569, 329, 16, 12, "#b9683a");
    this.rect(572, 325 - (frame % 2) * 3, 10, 15, "#df9845");
    this.rect(576, 322 + (frame % 3) * 2, 5, 18, "#f0c561");
    this.rect(576, 331, 4, 8, "#ffe19a");
    this.glow(576, 335, 64);
    if (!this.reduced) {
      const rise = (this.time * 13) % 27;
      this.ctx.globalAlpha = 1 - rise / 27;
      this.rect(571 + Math.sin(this.time * 3) * 4, 324 - rise, 2, 2, "#e4c078");
      this.ctx.globalAlpha = 1;
    }
  }
  waterfalls() {
    for (const [x, y, h] of [
      [164, 162, 93],
      [804, 145, 110],
    ]) {
      this.path(
        [
          [x - 28, y - 12],
          [x + 29, y - 8],
          [x + 35, y + h],
          [x - 35, y + h],
        ],
        "#374b44",
      );
      this.rect(x - 15, y, 30, h, "#3e727a");
      this.rect(x - 7, y, 10, h, "#83b4b5");
      this.rect(x + 9, y, 4, h, "#a9ccc1");
      this.ellipse(x, y + h + 5, 70, 24, "#294b51");
      this.ellipse(x, y + h + 1, 44, 12, "#719e99");
      const phase = this.reduced ? 0 : Math.floor(this.time * 17) % 18;
      for (let yy = phase; yy < h; yy += 18) {
        this.rect(x - 11, y + yy, 7, 8, "#bdd5c7");
        this.rect(x + 3, y + ((yy + 8) % h), 5, 5, "#659b9f");
      }
      for (let j = 0; j < 5; j++)
        this.rect(
          x - 22 + j * 10,
          y + h - 4 + ((j + phase) % 3) * 2,
          4,
          3,
          "#c1d2bb",
        );
      this.rect(x - 27, y - 4, 54, 5, "#819587");
    }
  }
  fountainWater() {
    const phase = this.reduced ? 0 : Math.floor(this.time * 6) % 4;
    for (const side of [-1, 1]) {
      this.path(
        [
          [482 + side * 9, 291],
          [482 + side * 18, 298],
          [482 + side * 24, 316],
          [482 + side * 21, 316],
          [482 + side * 15, 300],
        ],
        "#8ebbb2",
      );
      this.rect(482 + side * 23, 311 + phase * 2, 3, 5, "#c3dace");
      this.rect(482 + side * 22 - 5, 322, 12, 2, "#abd0c0");
    }
    this.rect(449 + phase * 3, 318, 15, 2, "#8ab6af");
    this.rect(499 - phase * 2, 323, 11, 2, "#bad0b8");
  }
  rabbit(state, index) {
    const c = this.ctx;
    c.save();
    c.translate(Math.round(state.x / 2) * 2, Math.round(state.y / 2) * 2);
    c.scale(state.facing, 1);
    const hop = this.reduced ? 0 : [0, -3, -6, -2][state.frame];
    this.ellipse(0, 2, 22, 5, "#172920");
    const fur = index ? "#b9b4a0" : "#d8d6c0";
    this.ellipse(-2, -7 + hop, 17, 12, fur);
    this.rect(-12, -9 + hop, 5, 5, "#efdfc7");
    this.ellipse(7, -12 + hop, 10, 10, fur);
    this.rect(5, -27 + hop, 4, 13, fur);
    this.rect(11, -25 + hop, 4, 11, fur);
    this.rect(7, -23 + hop, 2, 6, "#bd8e89");
    this.rect(13, -22 + hop, 2, 5, "#bd8e89");
    this.rect(10, -14 + hop, 2, 2, "#354138");
    this.rect(13, -10 + hop, 3, 2, "#b48d7a");
    this.rect(-6, -2 + hop, 6, 3, fur);
    this.rect(5, -2 + hop, 6, 3, fur);
    c.restore();
  }
  fox(state) {
    const c = this.ctx;
    c.save();
    c.translate(Math.round(state.x / 2) * 2, Math.round(state.y / 2) * 2);
    c.scale(state.facing, 1);
    const stride = [0, 2, 0, -2][state.frame],
      bob = state.frame % 2 ? -2 : 0;
    this.ellipse(0, 2, 33, 7, "#172920");
    // A bushy tail with a cream tip, pointed ears, and a four-frame trot.
    this.rect(-23, -12 + bob, 12, 7, "#a76236");
    this.rect(-29, -14 + bob, 9, 7, "#e0d0a3");
    this.rect(-20, -9 + bob, 9, 7, "#c47b43");
    this.rect(-12, -12 + bob, 24, 11, "#b86d38");
    this.rect(-11, -14 + bob, 19, 5, "#d58d4b");
    this.rect(-8, -5 + bob, 18, 4, "#e3cc93");
    this.rect(-11, -2 + stride, 4, 5, "#4d3e2d");
    this.rect(-4, -2 - stride, 4, 5, "#5c4630");
    this.rect(7, -2 + stride, 4, 5, "#4d3e2d");
    this.rect(7, -18 + bob, 12, 12, "#ca8246");
    this.rect(8, -23 + bob, 4, 6, "#b66c38");
    this.rect(14, -23 + bob, 4, 6, "#b66c38");
    this.rect(10, -21 + bob, 2, 3, "#46372b");
    this.rect(16, -11 + bob, 8, 5, "#ebd8a6");
    this.rect(22, -11 + bob, 3, 3, "#342e27");
    this.rect(16, -16 + bob, 2, 2, "#302f27");
    c.restore();
  }
  skyClouds() {
    const c = this.ctx;
    c.save();
    for (const cloud of this.clouds) {
      const drift = this.reduced ? 0 : this.time * cloud.speed;
      const x = ((cloud.x + drift + 180) % (WIDTH + 360)) - 180;
      const y = cloud.y;
      c.globalAlpha = 0.76;
      this.ellipse(x, y, cloud.w, cloud.h, "#4b5e62");
      this.ellipse(
        x - cloud.w * 0.18,
        y - 5,
        cloud.w * 0.44,
        cloud.h * 0.92,
        "#4b5e62",
      );
      this.ellipse(
        x + cloud.w * 0.15,
        y - 3,
        cloud.w * 0.5,
        cloud.h * 0.8,
        "#4b5e62",
      );
      c.globalAlpha = 0.39;
      this.rect(
        x - cloud.w * 0.32,
        y + cloud.h * 0.22,
        cloud.w * 0.64,
        3,
        "#69746e",
      );
    }
    c.restore();
  }
  moonlight() {
    const c = this.ctx;
    c.save();
    // Pixel-stepped shafts are rendered before scenery, which occludes the light.
    const breathe = this.reduced ? 1 : 0.94 + Math.sin(this.time * 0.24) * 0.06;
    const moon = this.moonPosition(),
      originY = moon.y - this.layout.skyHeight;
    const shafts = [
      {
        points: [
          [moon.x - 14, originY + 14],
          [moon.x - 5, originY + 14],
          [390, 540],
          [270, 540],
        ],
        alpha: 0.038,
      },
      {
        points: [
          [moon.x - 4, originY + 15],
          [moon.x + 4, originY + 15],
          [655, 540],
          [485, 540],
        ],
        alpha: 0.052,
      },
      {
        points: [
          [moon.x + 7, originY + 12],
          [moon.x + 13, originY + 12],
          [892, 530],
          [744, 530],
        ],
        alpha: 0.029,
      },
    ];
    for (const shaft of shafts) {
      c.globalAlpha = shaft.alpha * breathe;
      this.path(shaft.points, "#b5d5c8");
    }
    c.restore();
  }
  draw() {
    const c = this.ctx;
    const top = Math.max(0, Math.floor(this.viewport.top / 2) * 2),
      bottom = Math.min(
        this.layout.height,
        Math.ceil(this.viewport.bottom / 2) * 2,
      );
    const height = Math.max(0, bottom - top);
    if (!height) return;
    c.save();
    c.beginPath();
    c.rect(0, top, WIDTH, height);
    c.clip();
    c.clearRect(0, top, WIDTH, height);
    c.drawImage(
      this.scene,
      0,
      top / 2,
      WIDTH / 2,
      height / 2,
      0,
      top,
      WIDTH,
      height,
    );
    if (top < this.layout.skyHeight + 620) {
      c.save();
      c.translate(0, this.layout.skyHeight);
      this.skyClouds();
      this.moonlight();
      this.waterfalls();
      for (let i = 0; i < 7; i++) {
        const phase = this.reduced ? 0 : Math.floor(this.time * 3 + i) % 4;
        this.rect(
          458 + Math.sin(i * 2) * 10 + phase * 2,
          148 + i * 19,
          12,
          2,
          "#51736b",
        );
      }
      const foxes = [
        foxState(this.time, 0, this.reduced),
        foxState(this.time, 1, this.reduced),
      ];
      const rabbits = [
        rabbitState(this.time, 0, this.reduced),
        rabbitState(this.time, 1, this.reduced),
      ];
      const sorted = [
        { y: 344, draw: () => this.fountainWater() },
        ...destinations.map((d) => ({
          y: d.y + d.h,
          draw: () => this.building(d),
        })),
        ...this.trees.map((t) => ({ y: t.y, draw: () => this.tree(t) })),
        ...foxes.map((fox) => ({ y: fox.y, draw: () => this.fox(fox) })),
        ...rabbits.map((rabbit, i) => ({
          y: rabbit.y,
          draw: () => this.rabbit(rabbit, i),
        })),
        { y: this.player.y, draw: () => this.character() },
      ].sort((a, b) => a.y - b.y);
      sorted.forEach((o) => o.draw());
      destinations.forEach((d) => this.smoke(d));
      [
        [363, 289],
        [596, 314],
        [334, 420],
        [633, 452],
        [458, 460],
      ].forEach(([x, y]) => this.lantern(x, y));
      this.rect(531, 318, 4, 30, "#796343");
      this.rect(516, 318, 37, 10, "#b69b66");
      this.rect(519, 320, 29, 2, "#78613e");
      this.fire();
      // A sleeping cat beside the cabin: only its tail stirs.
      this.rect(626, 426, 17, 8, "#9f9472");
      this.rect(623, 424, 7, 8, "#9f9472");
      this.rect(623, 421, 3, 4, "#b4a17b");
      this.rect(627, 429, 2, 2, "#4c4e37");
      this.rect(636, 431, 9, 2, "#756f50");
      this.rect(
        643,
        424 + (this.reduced ? 0 : Math.round(Math.sin(this.time * 0.7)) * 2),
        7,
        3,
        "#aaa07b",
      );
      this.flies.forEach((f) => {
        const t = this.reduced ? f.phase : this.time;
        const x = f.x + Math.sin(t * 0.5 + f.phase) * 9,
          y = f.y + Math.cos(t * 0.7 + f.phase) * 6;
        c.globalAlpha = 0.4 + (0.5 + 0.5 * Math.sin(t + f.phase)) * 0.6;
        this.rect(x, y, 2, 2, "#cfcb85");
        c.globalAlpha = 1;
      });
      if (this.near) {
        const d = destinations.find((d) => d.id === this.near);
        this.rect(d.doorX - 4, d.y + d.h - 52, 8, 4, "#f1d58b");
        this.rect(d.doorX - 2, d.y + d.h - 48, 4, 3, "#f1d58b");
      }
      c.restore();
    }
    if (!this.reduced) {
      c.globalAlpha = 0.35;
      this.rain.forEach((r) => {
        const y = top + ((r.y + this.time * r.s) % (height + 16)) - 8,
          x = r.x;
        this.rect(x, y, 2, 8, "#bdc9c4");
      });
      c.globalAlpha = 1;
    }
    c.restore();
  }
  frame(now) {
    const dt = this.last ? Math.min((now - this.last) / 1000, 0.04) : 0;
    this.last = now;
    if (!document.hidden && this.visible) {
      if (this.active && this.gameVisible) {
        const dx =
            Number(this.keys.has("right")) - Number(this.keys.has("left")),
          dy = Number(this.keys.has("down")) - Number(this.keys.has("up"));
        this.walking = movePlayer(this.player, dx, dy, dt, (x, y) =>
          this.isWalkable(x, y),
        );
        if (this.walking) this.walkTime += dt;
        else this.walkTime = 0;
        const near = nearbyArea(this.player.x, this.player.y);
        if (near !== this.near) {
          this.near = near;
          this.onNear(near);
        }
      } else this.walking = false;
      this.time += dt;
      this.draw();
    }
    requestAnimationFrame(this.frame);
  }
}
