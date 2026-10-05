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
    this.scene.width = WIDTH;
    this.scene.height = HEIGHT;
    const main = this.ctx;
    this.ctx = this.scene.getContext("2d");
    this.drawTerrain();
    this.ctx = main;
    this.frame = this.frame.bind(this);
    requestAnimationFrame(this.frame);
  }
  rect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      Math.round(x),
      Math.round(y),
      Math.round(w),
      Math.round(h),
    );
  }
  path(points, color) {
    const c = this.ctx;
    c.fillStyle = color;
    c.beginPath();
    points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fill();
  }
  drawTerrain() {
    const c = this.ctx;
    this.rect(0, 0, 960, 540, "#14282b");
    this.rect(0, 0, 960, 116, "#15222d");
    this.path(
      [
        [0, 130],
        [65, 80],
        [130, 110],
        [205, 56],
        [269, 105],
        [344, 64],
        [430, 119],
        [523, 58],
        [604, 118],
        [719, 66],
        [824, 110],
        [904, 55],
        [960, 80],
        [960, 160],
        [0, 160],
      ],
      "#1b3037",
    );
    this.path(
      [
        [0, 149],
        [88, 102],
        [177, 139],
        [305, 92],
        [405, 144],
        [566, 103],
        [680, 137],
        [825, 91],
        [960, 148],
        [960, 189],
        [0, 189],
      ],
      "#1a3739",
    );
    this.rect(798, 40, 3, 3, "#b3b995");
    this.rect(72, 45, 2, 2, "#687f80");
    this.rect(290, 31, 2, 2, "#718587");
    this.rect(584, 48, 2, 2, "#718587");
    // Pixel crescent.
    this.rect(835, 29, 18, 4, "#acb99c");
    this.rect(829, 33, 27, 5, "#acb99c");
    this.rect(826, 38, 28, 15, "#acb99c");
    this.rect(830, 53, 24, 5, "#acb99c");
    this.rect(835, 58, 15, 3, "#acb99c");
    this.rect(840, 27, 19, 25, "#15222d");
    this.rect(847, 51, 10, 5, "#15222d");
    // Stream and rocky banks.
    this.path(
      [
        [439, 131],
        [483, 122],
        [505, 170],
        [467, 210],
        [496, 257],
        [521, 298],
        [491, 328],
        [465, 312],
        [478, 264],
        [446, 224],
        [455, 181],
      ],
      "#263c40",
    );
    this.path(
      [
        [452, 130],
        [478, 130],
        [490, 172],
        [455, 208],
        [485, 256],
        [506, 296],
        [487, 313],
        [477, 305],
        [489, 267],
        [439, 221],
        [467, 172],
      ],
      "#27474b",
    );
    this.grass.forEach((g) => {
      if (g.y > 149)
        this.rect(
          g.x,
          g.y,
          g.v > 0.8 ? 3 : 2,
          2,
          g.v > 0.6 ? "#294139" : "#1b3331",
        );
      if (g.v > 0.92) {
        this.rect(g.x, g.y - 3, 1, 4, "#345045");
        this.rect(g.x + 2, g.y - 2, 1, 3, "#345045");
      }
    });
    // Connected worn pathways.
    this.path(
      [
        [289, 279],
        [329, 279],
        [369, 316],
        [471, 310],
        [643, 286],
        [705, 277],
        [722, 303],
        [645, 314],
        [519, 344],
        [561, 382],
        [694, 425],
        [733, 428],
        [729, 463],
        [682, 454],
        [528, 402],
        [463, 368],
        [387, 397],
        [272, 457],
        [238, 445],
        [248, 418],
        [375, 369],
        [431, 343],
        [350, 344],
      ],
      "#495046",
    );
    this.path(
      [
        [463, 337],
        [492, 339],
        [501, 466],
        [540, 540],
        [447, 540],
        [467, 468],
      ],
      "#495046",
    );
    const r = seeded(511);
    for (let i = 0; i < 260; i++) {
      const x = 215 + r() * 530,
        y = 281 + r() * 259;
      if (
        Math.abs(y - (340 + Math.abs(x - 480) * 0.3)) < 22 ||
        (Math.abs(x - 481) < 17 && y > 340)
      )
        this.rect(x, y, 4 + r() * 5, 2, r() > 0.5 ? "#656351" : "#38423c");
    }
    // Cross-stream bridge.
    this.rect(444, 279, 80, 32, "#27312d");
    for (let i = 0; i < 9; i++) this.rect(447 + i * 8, 279, 6, 32, "#726951");
    this.rect(440, 274, 88, 5, "#8b7956");
    this.rect(441, 311, 87, 4, "#8b7956");
    [443, 521].forEach((x) => {
      this.rect(x, 267, 5, 55, "#5e573f");
      this.rect(x, 266, 5, 3, "#ad9562");
    });
    this.trees
      .filter((t) => t.y < 260)
      .sort((a, b) => a.y - b.y)
      .forEach((t) => this.tree(t));
    // Ground objects: stones, stumps, mushrooms.
    for (let i = 0; i < 45; i++) {
      const x = r() * 940,
        y = 220 + r() * 300;
      if (nearbyArea(x, y) || !canWalk(x, y) || Math.abs(x - 480) < 45)
        continue;
      this.rect(x, y, 8, 4, "#4a5550");
      this.rect(x + 2, y - 3, 4, 3, "#59635a");
      if (i % 3 === 0) {
        this.rect(x + 10, y, 2, 5, "#aaa084");
        this.rect(x + 8, y - 1, 6, 3, "#88574b");
      }
    }
    // Fence.
    for (let x = 325; x < 418; x += 20) {
      this.rect(x, 461, 3, 18, "#63644b");
      this.rect(x, 463, 20, 3, "#60614a");
      this.rect(x, 472, 20, 3, "#494e3c");
    }
    this.rect(568, 455, 40, 4, "#807151");
    this.rect(573, 459, 3, 12, "#665a42");
    this.rect(600, 459, 3, 12, "#665a42");
    this.rect(568, 446, 40, 7, "#655e45");
  }
  tree(t) {
    const x = Math.round(t.x),
      y = Math.round(t.y),
      s = t.s;
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    this.rect(-4, -13, 8, 27, "#4a4635");
    this.rect(-2, -13, 2, 24, "#62533b");
    const tone = t.tone > 0.5;
    this.path(
      [
        [0, -83],
        [-12, -61],
        [-7, -61],
        [-23, -38],
        [-16, -39],
        [-31, -11],
        [-23, -12],
        [-38, 10],
        [36, 10],
        [24, -12],
        [30, -11],
        [16, -39],
        [22, -38],
        [8, -61],
        [12, -61],
      ],
      tone ? "#1c3c34" : "#18372f",
    );
    this.path(
      [
        [0, -77],
        [-10, -60],
        [-5, -60],
        [-19, -37],
        [-12, -38],
        [-26, -11],
        [-19, -12],
        [-31, 5],
        [-3, 5],
        [-3, -64],
      ],
      tone ? "#2b4c3d" : "#234737",
    );
    this.rect(-14, -30, 9, 2, "#36583e");
    this.rect(-20, -6, 14, 2, "#33533c");
    c.restore();
  }
  glow(x, y, size, color = "#e8b65b") {
    const c = this.ctx;
    const g = c.createRadialGradient(x, y, 1, x, y, size);
    g.addColorStop(0, color + "3a");
    g.addColorStop(1, color + "00");
    c.fillStyle = g;
    c.fillRect(x - size, y - size, size * 2, size * 2);
  }
  building(d) {
    const { x, y, w, h, id } = d;
    this.rect(x - 6, y + h - 1, w + 15, 14, "#0b1d23");
    this.rect(x, y + 25, w, h - 24, "#5c5946");
    this.rect(
      x + 5,
      y + 30,
      w - 10,
      h - 30,
      id === "gamedev" ? "#4c4e49" : "#66604a",
    );
    for (let yy = y + 40; yy < y + h; yy += 12) {
      this.rect(x + 4, yy, w - 8, 2, "#3f4438");
      for (let xx = x + 10; xx < x + w - 6; xx += 25)
        this.rect(xx + (yy % 24 ? 7 : 0), yy - 10, 2, 10, "#50513f");
    }
    if (id === "career") {
      this.rect(x + 24, y - 29, w - 47, 67, "#69705c");
      for (let i = 0; i < 5; i++)
        this.rect(x + 24, y - 20 + i * 11, w - 47, 2, "#46544b");
      this.rect(x + 34, y - 41, w - 68, 13, "#4b5b54");
      this.rect(x + 41, y - 48, w - 82, 9, "#77806a");
      this.path(
        [
          [x + 16, y - 27],
          [x + w - 10, y - 27],
          [x + w - 2, y + 3],
          [x + 8, y + 3],
        ],
        "#414b50",
      );
      this.rect(x + 28, y - 21, w - 52, 20, "#70817a");
      this.rect(x + 48, y - 24, 8, 25, "#a2a589");
      this.rect(x + 34, y + 13, w - 70, 20, "#e5c083");
      this.rect(x + 37, y + 17, w - 77, 12, "#efcc85");
      this.rect(x + 54, y + 13, 3, 20, "#6b6550");
      this.rect(x + w - 15, y - 35, 5, 28, "#a4aa8a");
      this.rect(x + w - 12, y - 41, 22, 8, "#737f73");
    } else {
      this.rect(x + w - 33, y - 17, 14, 39, "#5a5b4b");
      this.rect(x + w - 36, y - 20, 20, 5, "#77725b");
    }
    this.path(
      [
        [x - 14, y + 36],
        [x + w / 2, y - 10],
        [x + w + 14, y + 36],
        [x + w + 14, y + 45],
        [x - 14, y + 45],
      ],
      id === "gamedev" ? "#514656" : "#434e4c",
    );
    this.path(
      [
        [x - 10, y + 34],
        [x + w / 2, y - 6],
        [x + w + 9, y + 34],
      ],
      id === "gamedev" ? "#675166" : "#5a6660",
    );
    for (let i = 0; i < 5; i++) {
      const yy = y + 5 + i * 7;
      const half = (yy - y + 10) * 1.5;
      this.rect(
        x + w / 2 - half,
        yy,
        half * 2,
        2,
        id === "gamedev" ? "#4c424e" : "#424f4b",
      );
    }
    this.rect(x - 12, y + 40, w + 24, 5, "#8a7a56");
    // Door and warmly lit windows.
    this.rect(d.doorX - 13, y + h - 42, 26, 42, "#383b32");
    this.rect(d.doorX - 9, y + h - 37, 18, 37, "#ac8350");
    this.rect(d.doorX - 6, y + h - 32, 12, 22, "#d1a666");
    this.rect(d.doorX + 5, y + h - 14, 2, 2, "#e6c987");
    this.rect(d.doorX - 15, y + h, 30, 5, "#a0916b");
    this.rect(d.doorX - 19, y + h + 5, 38, 4, "#6d7258");
    [x + 16, x + w - 39].forEach((wx) => {
      this.rect(wx - 3, y + h - 47, 27, 28, "#353d35");
      this.rect(
        wx,
        y + h - 44,
        21,
        22,
        id === "gamedev" ? "#d99f8a" : "#ddbb79",
      );
      this.rect(wx + 2, y + h - 42, 17, 18, "#f0ce85");
      this.rect(wx + 9, y + h - 44, 3, 22, "#695a40");
      this.rect(wx, y + h - 34, 21, 2, "#695a40");
      this.rect(wx - 3, y + h - 20, 27, 4, "#7e7454");
      this.glow(
        wx + 10,
        y + h - 33,
        42,
        id === "gamedev" ? "#d39383" : "#e8b65b",
      );
    });
    if (id === "gamedev") {
      this.rect(x + 30, y + 48, 65, 16, "#302c37");
      this.rect(x + 35, y + 52, 54, 3, "#c49c94");
      this.rect(x + 39, y + 58, 46, 2, "#997b85");
    }
    if (id === "projects") {
      this.rect(x - 22, y + h - 20, 16, 20, "#65513b");
      this.rect(x - 21, y + h - 18, 14, 3, "#96794e");
      this.rect(x + w + 6, y + h - 15, 12, 16, "#594d3c");
    }
  }
  lantern(x, y) {
    this.rect(x, y - 31, 3, 33, "#5b6450");
    this.rect(x - 7, y - 33, 10, 3, "#647055");
    this.rect(x - 7, y - 30, 6, 10, "#d9b770");
    this.rect(x - 9, y - 32, 10, 3, "#504e3a");
    this.rect(x - 9, y - 20, 10, 2, "#504e3a");
    this.glow(x - 4, y - 25, 57);
  }
  label(d) {
    const c = this.ctx;
    const y = d.y + d.h + 26;
    c.font = "bold 10px monospace";
    const w = c.measureText(d.label).width + 24;
    this.rect(d.doorX - w / 2, y - 11, w, 29, "#102127e8");
    this.rect(d.doorX - w / 2, y - 11, w, 1, "#566855");
    c.textAlign = "center";
    c.fillStyle = d.color;
    c.fillText(d.label, d.doorX, y);
    c.font = "7px monospace";
    c.fillStyle = "#8fa295";
    c.fillText(d.sub, d.doorX, y + 11);
  }
  character() {
    const { x, y, facing } = this.player;
    const px = Math.round(x),
      py = Math.round(y),
      step = this.walking && !this.reduced ? Math.sin(this.time * 13) : 0;
    this.rect(px - 7, py + 1, 15, 3, "#112227");
    this.rect(px - 5, py - 5, 4, 7 + (step > 0 ? 1 : 0), "#443e38");
    this.rect(px + 2, py - 5, 4, 7 + (step < 0 ? 1 : 0), "#443e38");
    this.rect(px - 7, py - 18, 14, 14, "#879382");
    this.rect(px - 9, py - 16, 3, 9, "#a0ab91");
    this.rect(px + 7, py - 16, 3, 9, "#a0ab91");
    this.rect(px - 6, py - 29, 12, 12, "#d1b88b");
    this.rect(px - 7, py - 30, 14, 6, "#413d39");
    this.rect(px - 8, py - 24, 3, 7, "#413d39");
    this.rect(px - 7, py - 18, 14, 4, "#b46a58");
    this.rect(px + 5, py - 15, 4, 9, "#9d5348");
    if (facing !== "up") {
      this.rect(px + (facing === "left" ? -4 : 2), py - 23, 2, 2, "#383b36");
    }
    this.rect(px - 1, py - 14, 7, 8, "#626e60");
  }
  draw() {
    const c = this.ctx;
    c.clearRect(0, 0, 960, 540);
    c.drawImage(this.scene, 0, 0);
    // Stream glints.
    for (let i = 0; i < 8; i++) {
      const y = 145 + i * 19,
        x = 466 + Math.sin(i * 2) * 10;
      this.rect(
        x + (this.reduced ? 0 : Math.sin(this.time + i) * 3),
        y,
        9,
        1,
        "#56817c",
      );
    }
    const sorted = [
      ...destinations.map((d) => ({
        y: d.y + d.h,
        draw: () => this.building(d),
      })),
      ...this.trees
        .filter((t) => t.y >= 260)
        .map((t) => ({ y: t.y, draw: () => this.tree(t) })),
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
    // Central wayfinder.
    this.rect(531, 316, 4, 32, "#746749");
    this.rect(516, 317, 36, 10, "#9a8458");
    this.rect(519, 319, 29, 2, "#544f38");
    this.rect(518, 330, 29, 9, "#81704d");
    this.rect(522, 333, 20, 2, "#4a4b36");
    destinations.forEach((d) => this.label(d));
    this.flies.forEach((f) => {
      const t = this.reduced ? f.phase : this.time;
      const x = f.x + Math.sin(t * 0.5 + f.phase) * 9,
        y = f.y + Math.cos(t * 0.7 + f.phase) * 6;
      const a = 0.25 + (0.5 + 0.5 * Math.sin(t + f.phase)) * 0.6;
      c.globalAlpha = a;
      this.rect(x, y, 2, 2, "#d2ce85");
      this.glow(x, y, 9, "#cad58a");
      c.globalAlpha = 1;
    });
    if (!this.reduced) {
      c.globalAlpha = 0.2;
      this.rain.forEach((r) => {
        const y = ((r.y + this.time * r.s) % 570) - 15,
          x = (r.x - this.time * 13 + 9600) % 980;
        this.rect(x, y, 1, 7, "#9bb5b6");
      });
      c.globalAlpha = 1;
    }
    const mist = c.createLinearGradient(0, 400, 0, 540);
    mist.addColorStop(0, "#7d9b9300");
    mist.addColorStop(1, "#7d9b9314");
    c.fillStyle = mist;
    c.fillRect(0, 400, 960, 140);
    if (this.near) {
      const d = destinations.find((d) => d.id === this.near);
      c.strokeStyle = "#d7bb7d";
      c.lineWidth = 1;
      c.strokeRect(d.doorX - 19, d.doorY - 44, 38, 45);
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
