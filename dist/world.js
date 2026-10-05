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
  if (x < 48 || x > 912 || y < 134 || y > 499) return false;
  if (x > 430 && x < 521 && y < 280) return false;
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
export function movePlayer(player, dx, dy, dt) {
  const length = Math.hypot(dx, dy);
  if (!length) return false;
  const amount = 100 * Math.min(dt, 0.04),
    x = player.x + (dx / length) * amount,
    y = player.y + (dy / length) * amount;
  if (canWalk(x, player.y)) player.x = x;
  if (canWalk(player.x, y)) player.y = y;
  player.facing = dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down";
  return true;
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
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.time = 0;
    this.last = 0;
    this.walking = false;
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
        if (y < 150 || x < 150 || x > 818 || (x > 384 && x < 577 && y < 235))
          this.trees.push({ x, y, s: 0.65 + rand() * 0.5, tone: rand() });
      }
    this.rain = Array.from({ length: 110 }, () => ({
      x: rand() * 960,
      y: rand() * 540,
      s: 25 + rand() * 55,
    }));
    this.flies = Array.from({ length: 22 }, () => ({
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
    // A small, pale moon over the valley.
    this.rect(814, 30, 26, 4, "#adb39b");
    this.rect(808, 34, 38, 26, "#adb39b");
    this.rect(814, 60, 26, 4, "#adb39b");
    this.rect(826, 28, 24, 25, "#17242b");
    this.rect(838, 51, 12, 8, "#17242b");
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
    // Winding dirt paths, edged with scattered warm stones.
    const trail = [
      [289, 277],
      [327, 277],
      [365, 316],
      [471, 309],
      [643, 283],
      [706, 278],
      [721, 306],
      [647, 314],
      [514, 346],
      [558, 382],
      [698, 426],
      [735, 427],
      [730, 458],
      [683, 452],
      [528, 401],
      [468, 367],
      [388, 396],
      [272, 455],
      [238, 445],
      [249, 416],
      [376, 368],
      [429, 343],
      [350, 345],
    ];
    this.path(trail, "#3b4436");
    this.path(
      trail.map(([x, y]) => [x, y - 4]),
      "#78664c",
    );
    this.path(
      [
        [465, 339],
        [493, 339],
        [502, 468],
        [544, 540],
        [444, 540],
        [465, 468],
      ],
      "#6f6048",
    );
    for (let i = 0; i < 340; i++) {
      const x = 220 + r() * 535,
        y = 286 + r() * 254;
      if (
        Math.abs(y - (340 + Math.abs(x - 480) * 0.3)) < 17 ||
        (Math.abs(x - 481) < 15 && y > 340)
      )
        this.rect(x, y, 4 + r() * 4, 2, r() > 0.55 ? "#93805a" : "#594f3e");
    }
    this.rect(442, 278, 84, 36, "#252f29");
    for (let x = 448; x < 520; x += 8) {
      this.rect(x, 278, 6, 36, "#967949");
      this.rect(x, 280, 2, 32, "#b0925d");
    }
    this.rect(438, 273, 90, 5, "#b39260");
    this.rect(438, 314, 90, 5, "#594936");
    [440, 524].forEach((x) => {
      this.rect(x, 269, 4, 53, "#72603f");
      this.rect(x, 267, 6, 4, "#b89a62");
    });
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
      c.globalAlpha = alpha;
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
  label(d) {
    const c = this.ctx,
      y = d.y + d.h + 26;
    c.font = "14px VT323, monospace";
    c.textAlign = "center";
    const text = d.sub === "ABOUT ME" ? "ABOUT" : d.sub;
    const w = c.measureText(text).width + 20;
    this.rect(d.doorX - w / 2 - 2, y - 14, w + 4, 20, "#302f26");
    this.rect(d.doorX - w / 2, y - 12, w, 16, "#776847");
    c.fillStyle = "#ead6a5";
    c.fillText(text, d.doorX, y + 1);
  }
  character() {
    const { x, y, facing } = this.player,
      px = Math.round(x / 2) * 2,
      py = Math.round(y / 2) * 2;
    this.rect(px - 11, py + 1, 22, 4, "#172720");
    this.rect(px - 8, py - 8, 6, 10, "#343632");
    this.rect(px + 2, py - 8, 6, 10, "#343632");
    this.rect(px - 11, py - 24, 22, 18, "#7c9980");
    this.rect(px - 13, py - 22, 4, 12, "#b6ac7d");
    this.rect(px + 9, py - 22, 4, 12, "#b6ac7d");
    this.rect(px - 8, py - 40, 16, 17, "#dcbb85");
    this.rect(px - 10, py - 42, 20, 9, "#4d4033");
    this.rect(px - 12, py - 37, 4, 12, "#4d4033");
    this.rect(px - 12, py - 26, 24, 5, "#b46a53");
    this.rect(px + 7, py - 22, 5, 12, "#964a43");
    if (facing !== "up") {
      this.rect(px + (facing === "left" ? -5 : 3), py - 32, 2, 3, "#39372e");
      this.rect(px - 3, py - 27, 6, 2, "#ad845a");
    }
    this.rect(px - 5, py - 18, 10, 10, "#5d7865");
    this.rect(px - 3, py - 16, 6, 2, "#9fa17c");
  }
  draw() {
    const c = this.ctx;
    c.clearRect(0, 0, 960, 540);
    c.drawImage(this.scene, 0, 0, 960, 540);
    const sorted = [
      ...destinations.map((d) => ({
        y: d.y + d.h,
        draw: () => this.building(d),
      })),
      ...this.trees.map((t) => ({ y: t.y, draw: () => this.tree(t) })),
      { y: this.player.y, draw: () => this.character() },
    ].sort((a, b) => a.y - b.y);
    sorted.forEach((o) => o.draw());
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
    destinations.forEach((d) => this.label(d));
    this.rect(569, 328, 15, 13, "#c88342");
    this.rect(572, 323, 9, 15, "#f0b853");
    this.rect(575, 326, 4, 11, "#f8d986");
    this.glow(576, 335, 55);
    this.flies.forEach((f) => {
      const t = this.reduced ? f.phase : this.time;
      const x = f.x + Math.sin(t * 0.5 + f.phase) * 9,
        y = f.y + Math.cos(t * 0.7 + f.phase) * 6;
      c.globalAlpha = 0.4 + (0.5 + 0.5 * Math.sin(t + f.phase)) * 0.6;
      this.rect(x, y, 2, 2, "#cfcb85");
      c.globalAlpha = 1;
    });
    if (!this.reduced) {
      c.globalAlpha = 0.14;
      this.rain.forEach((r) => {
        const y = ((r.y + this.time * r.s) % 570) - 15,
          x = (r.x - this.time * 13 + 9600) % 980;
        this.rect(x, y, 2, 6, "#9fb5a4");
      });
      c.globalAlpha = 1;
    }
    if (this.near) {
      const d = destinations.find((d) => d.id === this.near);
      this.rect(d.doorX - 4, d.y + d.h - 52, 8, 4, "#f1d58b");
      this.rect(d.doorX - 2, d.y + d.h - 48, 4, 3, "#f1d58b");
    }
  }
  frame(now) {
    const dt = this.last ? Math.min((now - this.last) / 1000, 0.04) : 0;
    this.last = now;
    if (!document.hidden) {
      if (this.active) {
        const dx =
            Number(this.keys.has("right")) - Number(this.keys.has("left")),
          dy = Number(this.keys.has("down")) - Number(this.keys.has("up"));
        this.walking = movePlayer(this.player, dx, dy, dt);
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
