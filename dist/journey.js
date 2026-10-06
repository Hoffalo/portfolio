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

function fireplace(p, x, y) {
  // A sheltered stone hearth, wool rug, chairs and a sleeping cat.
  p.ellipse(x, y + 9, 242, 198, "#334335");
  p.ellipse(x, y + 21, 206, 152, "#4a4533");
  p.ellipse(x, y - 18, 172, 134, "#655039");
  p.rect(x - 52, y - 44, 104, 57, "#2e332f");
  p.rect(x - 15, y - 124, 30, 67, "#586057");
  for (let row = 0; row < 7; row++) {
    p.rect(x - 13, y - 121 + row * 9, 26, 7, row % 2 ? "#717469" : "#666b60");
    p.rect(x + (row % 2 ? 1 : -4), y - 121 + row * 9, 2, 7, "#454b43");
  }
  p.rect(x - 20, y - 125, 40, 7, "#89907c");
  p.rect(x - 56, y - 68, 112, 12, "#4a5148");
  p.rect(x - 54, y - 72, 108, 7, "#838575");
  p.rect(x - 44, y - 56, 88, 66, "#6d7163");
  p.rect(x - 26, y - 46, 52, 52, "#222724");
  for (const side of [-1, 1]) {
    for (let row = 0; row < 5; row++) {
      p.rect(
        x + side * 35 - 8,
        y - 53 + row * 12,
        16,
        10,
        row % 2 ? "#89907c" : "#78816d",
      );
      p.rect(x + side * 35 - 8, y - 53 + row * 12, 16, 2, "#a0a38b");
    }
  }
  p.rect(x - 30, y - 58, 60, 12, "#93957f");
  p.rect(x - 23, y - 40, 46, 44, "#53382b");
  p.rect(x - 19, y - 36, 38, 36, "#784932");
  p.rect(x - 24, y, 48, 7, "#342b23");
  p.rect(x - 20, y - 4, 40, 4, "#805631");
  p.path(
    [
      [x - 17, y - 4],
      [x - 19, y - 16],
      [x - 12, y - 12],
      [x - 8, y - 32],
      [x - 1, y - 23],
      [x + 5, y - 39],
      [x + 11, y - 21],
      [x + 15, y - 25],
      [x + 19, y - 4],
    ],
    "#d7893f",
  );
  p.path(
    [
      [x - 11, y - 4],
      [x - 10, y - 18],
      [x - 4, y - 13],
      [x + 2, y - 29],
      [x + 8, y - 14],
      [x + 12, y - 4],
    ],
    "#f0ba66",
  );
  p.rect(x - 3, y - 14, 6, 13, "#f8dba0");
  p.rect(x - 61, y + 9, 122, 12, "#6b7060");
  p.rect(x - 60, y + 9, 120, 3, "#9b9b7d");
  // Brass candleholders sit on the mantle.
  for (const dx of [-41, 38]) {
    p.rect(x + dx, y - 82, 4, 10, "#dfc790");
    p.rect(x + dx, y - 86, 4, 5, "#efd395");
    p.rect(x + dx - 2, y - 74, 8, 3, "#ab8a50");
  }
  // Layered woven rug keeps this distinctly a fireside nook.
  p.rect(x - 51, y + 32, 102, 69, "#4d3d35");
  p.rect(x - 47, y + 36, 94, 61, "#985f4b");
  p.rect(x - 43, y + 40, 86, 53, "#744738");
  for (const dy of [45, 85]) p.rect(x - 40, y + dy, 80, 3, "#ba9566");
  for (let dx = -46; dx <= 46; dx += 8) {
    p.rect(x + dx, y + 28, 3, 7, "#b2966b");
    p.rect(x + dx, y + 98, 3, 7, "#b2966b");
  }
  p.path(
    [
      [x, y + 51],
      [x + 13, y + 66],
      [x, y + 81],
      [x - 13, y + 66],
    ],
    "#b79060",
  );
  p.path(
    [
      [x, y + 57],
      [x + 7, y + 66],
      [x, y + 75],
      [x - 7, y + 66],
    ],
    "#814e3b",
  );
  for (const side of [-1, 1]) {
    const cx = x + side * 77;
    p.rect(cx - 18, y + 26, 36, 48, "#46392b");
    p.rect(cx - 14, y + 27, 28, 31, "#a4774d");
    p.rect(cx - 11, y + 31, 22, 23, "#c49361");
    p.rect(cx - 19, y + 56, 38, 20, "#80563a");
    p.rect(cx - 13, y + 58, 26, 12, "#a7714e");
    p.rect(cx - 22, y + 45, 7, 22, "#bf925b");
    p.rect(cx + 15, y + 45, 7, 22, "#bf925b");
    for (const dx of [-15, 12]) p.rect(cx + dx, y + 76, 4, 10, "#4e3c2d");
  }
  // A wool throw over the left chair.
  p.rect(x - 88, y + 31, 12, 31, "#667b72");
  for (const dy of [37, 48, 58]) p.rect(x - 88, y + dy, 12, 2, "#9ca68e");
  // Cocoa on a little low table beside the right chair.
  p.ellipse(x + 97, y + 7, 34, 20, "#a98150");
  p.rect(x + 94, y + 14, 6, 14, "#614832");
  p.rect(x + 91, y - 1, 10, 9, "#d6c49f");
  p.rect(x + 93, y - 2, 6, 3, "#6b4935");
  p.rect(x + 101, y + 1, 3, 5, "#d6c49f");
  for (const [dx, dy] of [
    [-83, -22],
    [-99, -11],
    [-81, -5],
  ]) {
    p.rect(x + dx - 10, y + dy - 4, 25, 9, "#795738");
    p.ellipse(x + dx + 13, y + dy, 9, 9, "#bc9561");
    p.rect(x + dx + 12, y + dy - 2, 3, 4, "#805838");
  }
  p.ellipse(x + 23, y + 78, 30, 16, "#b7966b");
  p.ellipse(x + 34, y + 73, 14, 12, "#c6a67b");
  p.path(
    [
      [x + 28, y + 69],
      [x + 29, y + 63],
      [x + 34, y + 67],
      [x + 38, y + 64],
      [x + 40, y + 70],
    ],
    "#c6a67b",
  );
  p.rect(x + 31, y + 73, 6, 2, "#5d4c3a");
  p.ellipse(x + 11, y + 80, 15, 8, "#d0ad7e");
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
          paint: fireplace,
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
