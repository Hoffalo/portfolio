const WIDTH = 960;

function random(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function mushroom(p, x, y) {
  p.rect(x - 2, y - 8, 4, 8, "#cbb792");
  p.ellipse(x, y - 9, 14, 8, "#ad725e");
  p.rect(x - 4, y - 12, 2, 2, "#e2c89d");
}

function log(p, x, y) {
  p.rect(x - 27, y - 8, 54, 16, "#4b3c2c");
  p.rect(x - 25, y - 7, 48, 4, "#796043");
  p.ellipse(x + 27, y, 12, 16, "#aa8b59");
  p.ellipse(x + 27, y, 6, 10, "#6c5038");
  p.rect(x - 13, y + 4, 18, 3, "#405339");
}

function pond(p, x, y) {
  p.ellipse(x, y + 3, 218, 154, "#192a27");
  p.ellipse(x, y, 202, 140, "#537067");
  p.ellipse(x, y - 3, 192, 128, "#223d45");
  p.ellipse(x + 12, y - 8, 158, 96, "#2b4850");
  for (let i = 0; i < 8; i++) {
    const xx = x - 65 + ((i * 37) % 132),
      yy = y - 40 + ((i * 23) % 80);
    p.rect(xx, yy, 18 + (i % 3) * 4, 2, "#466166");
  }
  for (const [dx, dy] of [
    [-56, -18],
    [48, 20],
    [12, -38],
  ]) {
    p.ellipse(x + dx, y + dy, 20, 10, "#718653");
    p.rect(x + dx, y + dy - 3, 8, 3, "#304743");
    p.rect(x + dx - 4, y + dy - 5, 4, 4, "#d2a5ac");
  }
  p.rect(x - 54, y + 24, 60, 66, "#423b2d");
  for (let i = 0; i < 8; i++)
    p.rect(x - 52, y + 26 + i * 8, 56, 6, i % 2 ? "#967852" : "#816748");
  for (const dx of [-55, 5]) p.rect(x + dx, y + 76, 6, 22, "#b19869");
  p.lantern(x - 53, y + 88);
  p.rect(x - 39, y + 63, 14, 6, "#d4b585");
  p.rect(x - 36, y + 59, 8, 4, "#795a46");
}

function pod(p, x, y) {
  p.ellipse(x, y + 29, 186, 20, "#182b25");
  p.ellipse(x, y - 17, 152, 118, "#365046");
  p.ellipse(x, y - 19, 140, 106, "#715f44");
  p.ellipse(x, y - 23, 128, 96, "#968063");
  p.rect(x - 62, y - 30, 124, 49, "#715b43");
  for (let i = 0; i < 7; i++) p.rect(x - 62, y - 25 + i * 7, 124, 2, "#4d4535");
  p.rect(x - 16, y - 28, 32, 51, "#322d27");
  p.rect(x - 12, y - 24, 24, 45, "#a87946");
  p.rect(x - 9, y - 21, 18, 20, "#eed498");
  p.rect(x - 1, y - 22, 3, 22, "#73573b");
  p.rect(x + 7, y + 8, 3, 3, "#e1c27e");
  for (const dx of [-45, 34]) {
    p.rect(x + dx - 3, y - 25, 25, 25, "#423a2c");
    p.rect(x + dx, y - 22, 19, 19, "#dbb473");
    p.rect(x + dx + 8, y - 22, 3, 19, "#735637");
  }
  p.rect(x - 24, y + 21, 48, 8, "#9e8053");
  p.rect(x + 27, y - 85, 13, 30, "#50534a");
  p.rect(x + 25, y - 86, 17, 5, "#828070");
  p.lantern(x - 79, y + 30);
  log(p, x + 21, y + 94);
  p.ellipse(x - 36, y + 74, 35, 19, "#48534a");
  p.rect(x - 47, y + 73, 23, 4, "#725943");
  p.path(
    [
      [x - 44, y + 71],
      [x - 39, y + 52],
      [x - 33, y + 64],
      [x - 29, y + 56],
      [x - 24, y + 71],
    ],
    "#d29956",
  );
  p.rect(x - 37, y + 63, 6, 9, "#edd19a");
  p.rect(x + 38, y + 87, 7, 7, "#d6b98e");
}

function cave(p, x, y) {
  p.path(
    [
      [x - 97, y + 34],
      [x - 98, y - 13],
      [x - 72, y - 53],
      [x - 28, y - 72],
      [x + 24, y - 66],
      [x + 80, y - 41],
      [x + 103, y + 34],
    ],
    "#4d6157",
  );
  p.path(
    [
      [x - 92, y + 28],
      [x - 78, y - 19],
      [x - 37, y - 57],
      [x + 16, y - 57],
      [x + 66, y - 30],
      [x + 95, y + 28],
    ],
    "#657367",
  );
  p.path(
    [
      [x - 58, y + 29],
      [x - 52, y - 16],
      [x - 29, y - 40],
      [x + 17, y - 44],
      [x + 43, y - 17],
      [x + 53, y + 29],
    ],
    "#101e21",
  );
  p.path(
    [
      [x - 34, y + 27],
      [x - 24, y - 21],
      [x + 13, y - 31],
      [x + 34, y + 27],
    ],
    "#182a2b",
  );
  for (const [dx, dy] of [
    [-75, -16],
    [-45, -50],
    [49, -30],
    [76, 12],
  ]) {
    p.rect(x + dx, y + dy, 12, 8, "#527f81");
    p.rect(x + dx + 2, y + dy - 2, 4, 6, "#89b5ad");
    p.rect(x + dx + 8, y + dy + 4, 4, 4, "#bbcfb0");
  }
  for (const dx of [-94, -62, 44, 84]) p.rect(x + dx, y + 22, 20, 6, "#748052");
  for (const dx of [-40, 38]) {
    p.rect(x + dx, y + 16, 4, 12, "#ccb58a");
    p.rect(x + dx, y + 10, 4, 6, "#f1cc76");
    p.rect(x + dx - 2, y + 26, 8, 3, "#80735a");
  }
  p.rect(x + 13, y + 22, 28, 3, "#433b2c");
  p.rect(x + 15, y + 12, 4, 14, "#987952");
  p.rect(x + 13, y + 10, 18, 4, "#929789");
}

function sleepers(p, x, y) {
  p.ellipse(x, y + 8, 196, 112, "#344b35");
  p.ellipse(x - 35, y, 55, 25, "#a97242");
  p.ellipse(x - 13, y - 3, 21, 17, "#bc8952");
  p.path(
    [
      [x - 22, y - 10],
      [x - 20, y - 19],
      [x - 12, y - 9],
    ],
    "#b7834f",
  );
  p.ellipse(x - 51, y + 6, 30, 14, "#b98147");
  p.ellipse(x - 60, y + 6, 12, 11, "#e0c59b");
  p.rect(x - 14, y - 3, 6, 2, "#45362b");
  p.ellipse(x + 40, y + 36, 49, 22, "#88765c");
  p.ellipse(x + 58, y + 29, 23, 16, "#a8916c");
  p.path(
    [
      [x + 58, y + 22],
      [x + 63, y + 12],
      [x + 69, y + 23],
    ],
    "#a48d68",
  );
  p.rect(x + 59, y + 29, 7, 2, "#463e32");
  for (const dx of [25, 36, 44]) p.rect(x + dx, y + 32, 3, 3, "#c3b28c");
  p.ellipse(x + 35, y - 33, 27, 18, "#b5b29a");
  p.ellipse(x + 46, y - 37, 15, 12, "#c8c2a8");
  p.rect(x + 44, y - 55, 5, 15, "#c8c2a8");
  p.rect(x + 49, y - 53, 5, 14, "#c8c2a8");
  p.rect(x + 46, y - 55, 2, 11, "#947c72");
  p.rect(x + 47, y - 38, 5, 2, "#4f5045");
  mushroom(p, x - 84, y + 34);
  mushroom(p, x + 80, y - 25);
}

function campfire(p, x, y) {
  // An outdoor clearing: warm stones, log seats and cocoa under the trees.
  p.ellipse(x, y + 20, 242, 172, "#304334");
  p.path(
    [
      [x - 100, y + 16],
      [x - 72, y - 49],
      [x - 12, y - 68],
      [x + 67, y - 43],
      [x + 110, y + 24],
      [x + 68, y + 82],
      [x - 46, y + 88],
      [x - 105, y + 54],
    ],
    "#514432",
  );
  p.ellipse(x, y + 12, 152, 116, "#614b32");
  p.ellipse(x, y + 8, 108, 74, "#775435");
  for (const [dx, dy] of [
    [-88, 17],
    [-57, -36],
    [66, -17],
    [72, 58],
    [-44, 69],
  ]) {
    p.rect(x + dx, y + dy, 8, 4, "#79654a");
    p.rect(x + dx + 2, y + dy - 2, 4, 2, "#96835b");
  }
  // Three fallen trunks form seats; bright cut ends show their growth rings.
  for (const [dx, dy] of [
    [-82, 35],
    [81, 35],
    [0, 77],
  ]) {
    log(p, x + dx, y + dy);
    p.rect(x + dx - 22, y + dy - 6, 41, 3, "#997048");
    p.rect(x + dx - 12, y + dy - 2, 22, 2, "#6b4c33");
  }
  // A wool blanket rests on one log rather than furnishing the woodland.
  p.rect(x - 91, y + 27, 17, 18, "#72867a");
  for (const dy of [30, 36, 42]) p.rect(x - 91, y + dy, 17, 2, "#a1ad91");
  p.ellipse(x, y + 6, 82, 42, "#352e27");
  const stone = (dx, dy, tone) => {
    p.ellipse(x + dx, y + dy, 17, 11, tone);
    p.rect(x + dx - 5, y + dy - 3, 9, 2, "#a19c81");
  };
  for (const angle of [
    Math.PI,
    Math.PI * 1.2,
    Math.PI * 1.4,
    Math.PI * 1.6,
    Math.PI * 1.8,
    Math.PI * 2,
  ])
    stone(Math.cos(angle) * 37, Math.sin(angle) * 18 + 7, "#787965");
  // Crossed fuel and layered stepped flames sit inside the stone ring.
  p.path(
    [
      [x - 25, y + 10],
      [x - 21, y + 3],
      [x + 25, y + 17],
      [x + 21, y + 24],
    ],
    "#725035",
  );
  p.path(
    [
      [x - 24, y + 18],
      [x - 20, y + 25],
      [x + 25, y + 8],
      [x + 20, y + 1],
    ],
    "#997045",
  );
  p.path(
    [
      [x - 21, y + 14],
      [x - 23, y - 5],
      [x - 14, y - 1],
      [x - 11, y - 24],
      [x - 3, y - 15],
      [x + 5, y - 41],
      [x + 13, y - 15],
      [x + 20, y - 22],
      [x + 23, y + 14],
    ],
    "#d88538",
  );
  p.path(
    [
      [x - 13, y + 15],
      [x - 14, y - 3],
      [x - 5, y + 1],
      [x + 3, y - 27],
      [x + 10, y - 7],
      [x + 14, y + 15],
    ],
    "#f0bb64",
  );
  p.path(
    [
      [x - 5, y + 15],
      [x - 3, y - 3],
      [x + 3, y - 12],
      [x + 7, y + 15],
    ],
    "#ffe1a0",
  );
  for (const angle of [0.25, 0.65, 1.05, 1.45, 1.85, 2.25, 2.65])
    stone(Math.cos(angle) * 37, Math.sin(angle) * 18 + 7, "#88836b");
  for (const [dx, dy] of [
    [-7, -48],
    [12, -60],
    [5, -78],
  ]) {
    p.rect(x + dx, y + dy, 3, 4, "#d9aa62");
    p.rect(x + dx + 3, y + dy - 7, 2, 2, "#8b8972");
  }
  // Marshmallows on sticks lean from the seats toward the warmth.
  p.path(
    [
      [x - 83, y + 23],
      [x - 80, y + 25],
      [x - 20, y - 6],
      [x - 21, y - 9],
    ],
    "#b39161",
  );
  p.rect(x - 24, y - 13, 10, 9, "#e8d9b8");
  p.rect(x - 23, y - 5, 8, 2, "#b99061");
  p.path(
    [
      [x + 80, y + 26],
      [x + 82, y + 23],
      [x + 29, y - 1],
      [x + 27, y + 1],
    ],
    "#b39161",
  );
  p.rect(x + 23, y - 5, 10, 9, "#e8d9b8");
  // A mug and thermos sit on a flat stone beside the right seat.
  p.ellipse(x + 97, y + 2, 33, 18, "#707662");
  p.rect(x + 85, y - 11, 8, 13, "#8aa39a");
  p.rect(x + 86, y - 14, 6, 4, "#b0b6a2");
  p.rect(x + 98, y - 6, 10, 10, "#ddcba4");
  p.rect(x + 100, y - 7, 6, 3, "#654833");
  p.rect(x + 108, y - 3, 3, 6, "#ddcba4");
  p.ellipse(x + 37, y + 99, 29, 16, "#b7966b");
  p.ellipse(x + 48, y + 94, 14, 12, "#c6a67b");
  p.path(
    [
      [x + 42, y + 90],
      [x + 43, y + 84],
      [x + 48, y + 88],
      [x + 52, y + 85],
      [x + 54, y + 91],
    ],
    "#c6a67b",
  );
  p.rect(x + 45, y + 94, 6, 2, "#5d4c3a");
  p.ellipse(x + 25, y + 101, 15, 8, "#d0ad7e");
}

function landmarks(layout) {
  return layout.sections.flatMap((section) => {
    const x = layout.mobile ? 690 : section.x < 200 ? 840 : 114;
    const y = layout.mobile
      ? section.y - 140
      : section.y + Math.min(section.height / 2, 200);
    if (section.id === "about")
      return [
        {
          paint: campfire,
          x: layout.mobile ? 400 : x,
          y: layout.mobile ? section.y - 220 : section.y + 140,
          rx: 145,
          ry: 150,
        },
        {
          paint: pond,
          x: layout.mobile ? 720 : x,
          y: layout.mobile ? section.y - 100 : section.y + section.height - 100,
          rx: 125,
          ry: 110,
        },
      ];
    const paint = { projects: pod, career: cave, gamedev: sleepers }[
      section.id
    ];
    return paint ? [{ paint, x, y, rx: 135, ry: 145 }] : [];
  });
}

export function paintJourney(painter, layout) {
  const p = painter;
  const start = (layout.skyHeight || 0) + 540;
  const scenery = landmarks(layout);
  p.ctx.save();
  // Paint complete canopies across the clearing boundary. Clipping at the
  // ground transition would slice the tops of this first forest row.
  p.rect(0, start, WIDTH, Math.max(0, layout.height - start), "#22332e");
  const rand = random(3917);
  for (let i = 0; i < Math.ceil(layout.height * 1.8); i++) {
    const x = rand() * WIDTH,
      y = start + rand() * Math.max(0, layout.height - start);
    p.rect(x, y, 2 + rand() * 5, 2, rand() > 0.55 ? "#2b4035" : "#293a2e");
    if (i % 11 === 0) p.rect(x + 2, y - 3, 2, 4, "#3b5038");
  }
  const trees = [];
  for (let y = start + 35; y < layout.height + 90; y += 74) {
    for (let x = 25; x < WIDTH; x += 69) {
      const tx = x + (rand() - 0.5) * 38,
        ty = y + (rand() - 0.5) * 34;
      const besidePanel = layout.sections.some(
        (s) =>
          tx > s.x - 34 &&
          tx < s.x + s.width + 34 &&
          ty > s.y - 70 &&
          ty < s.y + s.height + 24,
      );
      const scenicOpening = scenery.some(
        (s) => Math.abs(tx - s.x) < s.rx && Math.abs(ty - s.y) < s.ry,
      );
      if (!besidePanel && !scenicOpening)
        trees.push({ x: tx, y: ty, s: 0.75 + rand() * 0.45, tone: rand() });
    }
  }
  for (const tree of trees.sort((a, b) => a.y - b.y)) p.tree(tree);
  for (const section of layout.sections) {
    // Small natural clusters, with no line of lanterns suggesting a route.
    const side = layout.mobile ? 52 : section.x < 200 ? 688 : 274;
    const y = layout.mobile ? section.y - 74 : section.y + section.height - 38;
    p.lantern(side, y);
    mushroom(p, side + 22, y + 13);
    mushroom(p, side + 33, y + 23);
    p.ellipse(side - 15, y + 24, 18, 10, "#617065");
    p.rect(side - 21, y + 20, 7, 2, "#859085");
  }
  for (const scene of scenery) scene.paint(p, scene.x, scene.y);
  p.ctx.restore();
}
