const WIDTH = 960;
const START = 540;

function random(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function trailKnots(layout) {
  const knots = [{ y: START, x: 494 }];
  for (const [index, section] of layout.sections.entries()) {
    const side = layout.mobile
      ? index % 2 === 0
        ? 26
        : 934
      : section.x < 200
        ? 690
        : 266;
    knots.push({ y: Math.max(START + 2, section.y - 24), x: side });
    knots.push({ y: section.y + section.height + 24, x: side });
  }
  knots.push({ y: layout.height, x: 494 });
  return knots.sort((a, b) => a.y - b.y);
}

export function pathAt(y, layout) {
  const knots = trailKnots(layout);
  if (y <= START) return 494;
  for (let i = 1; i < knots.length; i++) {
    const next = knots[i],
      previous = knots[i - 1];
    if (y <= next.y) {
      const t = Math.max(
        0,
        Math.min(1, (y - previous.y) / Math.max(1, next.y - previous.y)),
      );
      const smooth = t * t * (3 - 2 * t);
      return previous.x + (next.x - previous.x) * smooth;
    }
  }
  return 494;
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

export function paintJourney(painter, layout) {
  const p = painter;
  p.ctx.save();
  p.ctx.beginPath();
  p.ctx.rect(0, START, WIDTH, Math.max(0, layout.height - START));
  p.ctx.clip();
  p.rect(0, START, WIDTH, Math.max(0, layout.height - START), "#22332e");
  const rand = random(3917);
  for (let i = 0; i < Math.ceil(layout.height * 1.8); i++) {
    const x = rand() * WIDTH,
      y = START + rand() * Math.max(0, layout.height - START);
    p.rect(x, y, 2 + rand() * 5, 2, rand() > 0.55 ? "#2b4035" : "#293a2e");
    if (i % 11 === 0) p.rect(x + 2, y - 3, 2, 4, "#3b5038");
  }
  for (let y = START; y < layout.height; y += 2) {
    const center = pathAt(y, layout);
    p.rect(center - 43, y, 86, 2, "#514a37");
    p.rect(center - 34, y, 68, 2, "#6e5d42");
    p.rect(center - 25, y, 50, 2, "#776347");
    if (y % 18 === 0) p.rect(center - 20 + (y % 38), y, 8, 2, "#8b7550");
  }
  const trees = [];
  for (let y = START + 35; y < layout.height + 90; y += 74) {
    for (let x = 25; x < WIDTH; x += 69) {
      const tx = x + (rand() - 0.5) * 38,
        ty = y + (rand() - 0.5) * 34;
      const besideTrail = Math.abs(tx - pathAt(ty, layout)) < 100;
      const besidePanel = layout.sections.some(
        (s) =>
          tx > s.x - 34 &&
          tx < s.x + s.width + 34 &&
          ty > s.y - 70 &&
          ty < s.y + s.height + 24,
      );
      const scenicOpening = layout.sections.some((s) => {
        const sx = layout.mobile ? 690 : s.x < 200 ? 848 : 114;
        const sy = layout.mobile
          ? s.y - 140
          : s.y + Math.min(s.height / 2, 200);
        return Math.abs(tx - sx) < 135 && Math.abs(ty - sy) < 145;
      });
      if (!besideTrail && !besidePanel && !scenicOpening)
        trees.push({ x: tx, y: ty, s: 0.75 + rand() * 0.45, tone: rand() });
    }
  }
  for (const tree of trees.sort((a, b) => a.y - b.y)) p.tree(tree);
  for (let y = START + 150; y < layout.height - 80; y += 330) {
    const x = pathAt(y, layout);
    p.lantern(x - 57, y);
    mushroom(p, x + 62, y + 22);
    mushroom(p, x + 73, y + 29);
    p.ellipse(x - 74, y + 35, 18, 10, "#617065");
    p.rect(x - 80, y + 31, 7, 2, "#859085");
  }
  for (const section of layout.sections) {
    const x = layout.mobile ? 690 : section.x < 200 ? 848 : 114;
    const y = layout.mobile
      ? section.y - 140
      : section.y + Math.min(section.height / 2, 200);
    if (section.id === "about") pond(p, x, y);
    else if (section.id === "projects") pod(p, x, y);
    else if (section.id === "career") cave(p, x, y);
    else if (section.id === "gamedev") sleepers(p, x, y);
  }
  p.ctx.restore();
}
