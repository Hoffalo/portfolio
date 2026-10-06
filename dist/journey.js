import { paintGround, paintFern } from "./ground.js";

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

function stallHorse(p, x, y, feeding, time = 0) {
  const bob = time
    ? Math.round(Math.sin(time * (feeding ? 1.4 : 0.55))) * 2
    : 0;
  const tone = feeding ? "#aa7c4d" : "#c1bda4";
  const headY = y + (feeding ? 9 : -20) + bob;
  p.ellipse(x, y + 18, 59, 9, "#32372b");
  for (const dx of [-19, -9, 10, 19]) {
    p.rect(x + dx, y + 5, 5, 24, tone);
    p.rect(x + dx - 1, y + 26, 7, 4, "#39332a");
  }
  p.ellipse(x - 2, y, 48, 28, tone);
  p.path(
    [
      [x + 11, y - 9],
      [x + 20, headY - 7],
      [x + 29, headY + 2],
      [x + 21, y + 7],
    ],
    tone,
  );
  p.ellipse(x + 25, headY, 22, 15, tone);
  p.rect(x + 30, headY + 2, 8, 5, "#d0bfa0");
  p.rect(x + 19, headY - 16, 4, 11, tone);
  p.rect(x + 26, headY - 15, 4, 10, tone);
  p.rect(x + 28, headY - 3, 3, 2, "#3b372d");
  p.path(
    [
      [x + 12, y - 8],
      [x + 16, headY - 9],
      [x + 21, headY - 8],
      [x + 17, y + 2],
    ],
    "#4d4030",
  );
  p.path(
    [
      [x - 22, y - 6],
      [x - 28, y - 4],
      [x - 30 + (time ? Math.round(Math.sin(time)) * 2 : 0), y + 16],
      [x - 25, y + 18],
    ],
    "#4d4030",
  );
  if (feeding) {
    p.rect(x + 29, headY + 5, 10, 2, "#a89751");
    p.rect(x + 35, headY + 6, 2, 7, "#cab772");
  }
}

function stallFront(p) {
  for (const dx of [-98, 18]) {
    p.rect(dx, 35, 80, 6, "#9e7c4b");
    p.rect(dx, 47, 80, 5, "#85613c");
    p.rect(dx + 2, 31, 5, 27, "#c29a5d");
    p.rect(dx + 73, 31, 5, 27, "#c29a5d");
    p.rect(dx + 6, 36, 66, 2, "#c4a16a");
  }
}

function barn(p, x, y) {
  p.ellipse(x, y + 75, 440, 148, "#354333");
  p.ellipse(x, y + 69, 392, 113, "#5a4933");
  // A compact open-front timber stable, with hay and warm hanging lanterns.
  p.rect(x - 116, y - 65, 232, 121, "#483b2c");
  for (let dx = -112; dx < 114; dx += 16) {
    p.rect(x + dx, y - 62, 13, 114, "#76553b");
    p.rect(x + dx, y - 62, 3, 114, "#8b6746");
  }
  for (const dx of [-98, 18]) {
    p.rect(x + dx, y - 47, 80, 101, "#27302a");
    p.rect(x + dx + 4, y - 43, 72, 97, "#403c2d");
    p.rect(x + dx + 9, y + 25, 62, 27, "#a78b4c");
    for (let i = 0; i < 7; i++)
      p.rect(x + dx + 11 + i * 8, y + 22 + (i % 3) * 4, 3, 27, "#c2a662");
  }
  p.path(
    [
      [x - 136, y - 63],
      [x - 103, y - 113],
      [x + 101, y - 113],
      [x + 136, y - 63],
    ],
    "#293e38",
  );
  for (let row = 0; row < 5; row++) {
    const inset = (4 - row) * 7;
    p.rect(
      x - 131 + inset,
      y - 107 + row * 9,
      262 - inset * 2,
      7,
      row % 2 ? "#446052" : "#365349",
    );
  }
  p.rect(x - 138, y - 63, 276, 7, "#9c7b50");
  for (const dx of [-118, -4, 110]) {
    p.rect(x + dx, y - 57, 8, 115, "#b08a54");
    p.rect(x + dx + 2, y - 55, 3, 110, "#d0aa6e");
  }
  for (const side of [-1, 1]) {
    const sx = x + side * 179;
    p.rect(sx, y + 30, 7, 78, "#8c714b");
    p.rect(sx - 31, y + 46, 64, 7, "#a58b60");
    p.rect(sx - 31, y + 71, 64, 6, "#a58b60");
  }
  p.lantern(x - 113, y + 3);
  p.lantern(x + 117, y + 3);
  p.ellipse(x + 19, y + 132, 47, 20, "#665845");
  p.ellipse(x + 19, y + 127, 40, 15, "#3b5860");
}

function highlandCow(p, x, y, time = 0, phase = 0) {
  const bob = time ? Math.round(Math.sin(time * 0.65 + phase)) * 2 : 0;
  const tail = time ? Math.round(Math.sin(time * 0.9 + phase)) * 4 : 0;
  p.ellipse(x, y + 35, 105, 19, "#24342a");
  for (const dx of [-27, -13, 21, 34]) {
    p.rect(x + dx, y + 10, 10, 25, "#955e34");
    p.rect(x + dx - 1, y + 32, 12, 6, "#3f3429");
  }
  p.path(
    [
      [x - 42, y - 10],
      [x - 48, y - 4],
      [x - 53 + tail, y + 23],
      [x - 46 + tail, y + 27],
    ],
    "#b98042",
  );
  p.ellipse(x - 4, y, 91, 57, "#a86b35");
  p.ellipse(x - 13, y - 11, 65, 32, "#c28a47");
  for (let i = 0; i < 12; i++) {
    const dx = -43 + i * 7;
    p.rect(
      x + dx,
      y + 6 + (i % 3) * 3,
      7,
      12 + (i % 4) * 3,
      i % 3 ? "#ad743a" : "#ca924a",
    );
    p.rect(x + dx + 2, y - 13 + (i % 3) * 7, 3, 13, "#d19c53");
  }
  const hx = x + 30,
    hy = y - 8 + bob;
  for (const side of [-1, 1]) {
    p.path(
      [
        [hx + side * 15, hy - 12],
        [hx + side * 31, hy - 15],
        [hx + side * 36, hy - 28],
        [hx + side * 32, hy - 31],
        [hx + side * 26, hy - 20],
        [hx + side * 12, hy - 19],
      ],
      "#ddd0aa",
    );
    p.ellipse(hx + side * 22, hy, 17, 10, "#a66938");
    p.rect(hx + side * 20 - 4, hy - 2, 8, 4, "#c38a4b");
  }
  p.ellipse(hx, hy + 4, 41, 44, "#b8793e");
  p.ellipse(hx, hy - 10, 45, 22, "#d09a50");
  for (let i = 0; i < 7; i++)
    p.rect(
      hx - 21 + i * 6,
      hy - 10,
      7,
      17 + (i % 3) * 4,
      i % 2 ? "#c58b43" : "#d6a45a",
    );
  const blink = time && Math.floor(time * 0.32 + phase) % 8 === 0;
  for (const dx of [-12, 10])
    p.rect(hx + dx, hy + 4, 3, blink ? 2 : 4, "#3d3529");
  p.ellipse(hx, hy + 21, 28, 15, "#d0a56d");
  for (const dx of [-8, 5]) p.rect(hx + dx, hy + 19, 3, 3, "#80603c");
  p.rect(
    hx - 5,
    hy + 25,
    10,
    time && Math.floor(time * 1.5 + phase) % 2 ? 3 : 2,
    "#82613d",
  );
}

function grazingCow(p, x, y, time) {
  const chew = time ? (Math.floor(time * 1.8) % 2) * 2 : 0;
  const tail = time ? Math.round(Math.sin(time * 0.8)) * 3 : 0;
  p.ellipse(x, y + 37, 108, 17, "#24342a");
  for (const dx of [-26, -13, 17, 31]) {
    p.rect(x + dx, y + 10, 9, 27, "#744c31");
    p.rect(x + dx - 1, y + 34, 11, 5, "#343128");
  }
  p.path(
    [
      [x - 40, y - 6],
      [x - 47, y - 2],
      [x - 52 + tail, y + 27],
      [x - 44, y + 25],
    ],
    "#93603a",
  );
  p.ellipse(x - 4, y, 86, 49, "#875532");
  p.ellipse(x - 12, y - 9, 61, 29, "#aa7745");
  for (let i = 0; i < 11; i++)
    p.rect(
      x - 41 + i * 7,
      y + 7,
      7,
      12 + (i % 3) * 4,
      i % 2 ? "#93603a" : "#b17e47",
    );
  p.path(
    [
      [x + 21, y - 14],
      [x + 45, y + 10],
      [x + 39, y + 28],
      [x + 18, y + 8],
    ],
    "#9b693c",
  );
  p.ellipse(x + 43, y + 19 + chew, 35, 30, "#bb894d");
  for (const side of [-1, 1])
    p.path(
      [
        [x + 43 + side * 10, y + 13],
        [x + 43 + side * 28, y + 6],
        [x + 43 + side * 29, y - 4],
        [x + 43 + side * 24, y - 3],
        [x + 43 + side * 20, y + 3],
      ],
      "#ddd0aa",
    );
  for (let i = 0; i < 5; i++)
    p.rect(x + 27 + i * 6, y + 7 + chew, 7, 15 + (i % 2) * 4, "#c49152");
  p.rect(x + 36, y + 23 + chew, 5, 2, "#433528");
  p.ellipse(x + 46, y + 32 + chew, 23, 11, "#cfa56f");
  for (let i = 0; i < 4; i++)
    p.rect(x + 34 + i * 6, y + 38, 3, 7 + (i % 2) * 4, "#839351");
}

function sleepingCow(p, x, y, time) {
  const breath = time ? Math.round((Math.sin(time * 0.65) + 1) * 0.7) * 2 : 0;
  p.ellipse(x, y + 18, 94, 18, "#24342a");
  p.ellipse(x - 4, y - breath / 2, 89, 44 + breath, "#674b36");
  p.ellipse(x - 15, y - 8 - breath / 2, 62, 27 + breath, "#8e6b49");
  for (let i = 0; i < 10; i++)
    p.rect(x - 42 + i * 8, y + 8, 8, 7 + (i % 3) * 3, "#99724c");
  p.ellipse(x + 30, y + 5, 35, 29, "#a17b52");
  for (const side of [-1, 1])
    p.path(
      [
        [x + 30 + side * 10, y - 1],
        [x + 30 + side * 25, y - 8],
        [x + 30 + side * 28, y - 20],
        [x + 30 + side * 24, y - 22],
        [x + 30 + side * 19, y - 11],
      ],
      "#d1c29a",
    );
  for (let i = 0; i < 5; i++)
    p.rect(x + 14 + i * 6, y - 6, 7, 15 + (i % 2) * 3, "#b68c5c");
  p.rect(x + 21, y + 7, 6, 2, "#43382c");
  p.rect(x + 36, y + 8, 6, 2, "#43382c");
  p.ellipse(x + 30, y + 19, 24, 10, "#c3a47a");
  p.ellipse(x - 16, y + 17, 35, 11, "#a78258");
}

function calf(p, x, y, time) {
  const bob = time ? Math.round(Math.sin(time * 0.75)) * 2 : 0;
  const step = time ? Math.round(Math.sin(time * 1.4)) * 2 : 0;
  p.ellipse(x, y + 23, 67, 10, "#24342a");
  for (const [i, dx] of [-17, -6, 12, 21].entries()) {
    p.rect(x + dx, y + 7, 6, 16 + (i % 2 ? step : -step), "#cbab72");
    p.rect(x + dx - 1, y + 20 + (i % 2 ? step : -step), 8, 4, "#675137");
  }
  p.ellipse(x - 3, y, 55, 32, "#c0a16a");
  p.ellipse(x - 10, y - 7, 37, 17, "#dfc287");
  for (let i = 0; i < 8; i++)
    p.rect(x - 27 + i * 7, y + 7, 6, 7 + (i % 2) * 3, "#d7bb81");
  p.ellipse(x + 23, y - 2 + bob, 28, 28, "#d9b97c");
  for (const dx of [13, 29]) p.rect(x + dx, y - 22 + bob, 5, 9, "#e7d6ab");
  p.ellipse(x + 8, y - 6 + bob, 11, 7, "#d9b97c");
  p.ellipse(x + 38, y - 6 + bob, 11, 7, "#d9b97c");
  for (let i = 0; i < 5; i++)
    p.rect(x + 10 + i * 5, y - 12 + bob, 6, 12 + (i % 2) * 4, "#ead098");
  for (const dx of [15, 29]) p.rect(x + dx, y + 1 + bob, 3, 3, "#55452f");
  p.ellipse(x + 24, y + 11 + bob, 20, 9, "#eed9ad");
  p.rect(x + 21, y + 10 + bob, 6, 2, "#8d724c");
}

function farmGeometry(area) {
  return {
    barn: [235, area.y + 139, 1],
    cows: [
      [580, 130],
      [820, 195],
      [580, 315],
      [805, 325],
    ].map(([x, y]) => [x, area.y + y]),
    animalScale: 1,
  };
}

function farmFence(p, area, front) {
  const y = area.y + (front ? area.height - 20 : 28);
  for (let x = 20; x <= 944; x += 84) {
    p.rect(x, y - 25, 7, 31, "#8a7047");
    p.rect(x + 2, y - 23, 3, 28, "#bda06c");
    if (x < 940) {
      p.rect(x + 7, y - 18, 78, 6, "#ac9060");
      p.rect(x + 7, y - 5, 78, 5, "#967b50");
    }
  }
  if (front) {
    // A hinged gate gives the enclosed pasture a natural entrance.
    p.rect(363, y - 18, 77, 6, "#c1a16b");
    p.rect(363, y - 5, 77, 5, "#c1a16b");
    p.path(
      [
        [365, y - 17],
        [369, y - 18],
        [439, y - 2],
        [436, y + 1],
      ],
      "#ab8954",
    );
    p.rect(428, y - 11, 8, 3, "#d7c490");
  } else {
    for (const x of [20, 944]) {
      p.rect(x + 2, area.y + 35, 3, area.height - 57, "#9c8051");
      p.rect(x - 3, area.y + 35, 3, area.height - 57, "#735d3d");
      for (let yy = area.y + 80; yy < area.y + area.height - 30; yy += 64) {
        p.rect(x - 2, yy - 18, 9, 32, "#96784c");
        p.rect(x, yy - 16, 3, 29, "#c1a16b");
      }
    }
  }
}

function scaledAt(p, x, y, scale, paint) {
  p.ctx.save();
  p.ctx.translate(Math.round(x / 2) * 2, Math.round(y / 2) * 2);
  p.ctx.scale(scale, scale);
  paint();
  p.ctx.restore();
}

function farmActors(p, area, time = 0) {
  const g = farmGeometry(area);
  scaledAt(p, ...g.barn, () => {
    stallHorse(p, -58, 8, true, time);
    stallHorse(p, 56, 8, false, time);
    stallFront(p);
  });
  const poses = [highlandCow, grazingCow, sleepingCow, calf];
  g.cows.forEach(([x, y], i) =>
    scaledAt(
      p,
      x + (i === 3 && time ? Math.round(Math.sin(time * 0.18)) * 6 : 0),
      y,
      g.animalScale,
      () => poses[i](p, 0, 0, time, 1),
    ),
  );
  farmFence(p, area, true);
}

function farm(p, area, includeActors) {
  const g = farmGeometry(area);
  p.path(
    [
      [0, area.y + 25],
      [110, area.y + 4],
      [270, area.y + 24],
      [468, area.y + 6],
      [653, area.y + 20],
      [825, area.y + 2],
      [960, area.y + 24],
      [960, area.y + area.height - 13],
      [773, area.y + area.height - 3],
      [592, area.y + area.height - 19],
      [383, area.y + area.height - 4],
      [195, area.y + area.height - 17],
      [0, area.y + area.height - 4],
    ],
    "#3e4c32",
  );
  p.ellipse(
    480,
    area.y + area.height * 0.65,
    1050,
    area.height * 0.6,
    "#596044",
  );
  const rand = random(1784);
  for (let i = 0; i < 230; i++) {
    const x = rand() * WIDTH,
      y = area.y + 20 + rand() * (area.height - 40);
    p.rect(x, y, 4 + rand() * 8, 2, i % 3 ? "#67714a" : "#82734e");
  }
  farmFence(p, area, false);
  scaledAt(p, ...g.barn, () => {
    barn(p, 0, 0);
    stallFront(p);
    // Straw bales, a water bucket and a spare warm blanket by the stalls.
    p.rect(-111, 84, 66, 29, "#a58a4b");
    p.rect(-107, 87, 58, 4, "#d1b76a");
    for (const dx of [-99, -76, -56]) p.rect(dx, 87, 2, 23, "#d1b76a");
    p.rect(-107, 102, 58, 3, "#786438");
    p.ellipse(107, 91, 28, 21, "#737469");
    p.rect(95, 88, 24, 20, "#737469");
    p.ellipse(107, 88, 27, 12, "#a3a68d");
    p.ellipse(107, 89, 20, 7, "#42666a");
    p.rect(-30, 73, 35, 7, "#6f8c7b");
    p.rect(-26, 80, 5, 12, "#96ad92");
  });
  for (const x of [30, 926]) p.lantern(x, area.y + 370);
  for (const [x, y] of [
    [-10, 175],
    [-8, 300],
    [970, 172],
    [972, 300],
  ])
    p.tree({ x, y: area.y + y, s: 0.9, tone: 0.1 });
  for (let x = 100; x <= 370; x += 18) {
    const y = area.y + 14 + Math.sin(((x - 100) / 270) * Math.PI) * 9;
    p.rect(x, y, 18, 2, "#6c785a");
    if ((x - 100) % 54 === 0) {
      p.rect(x + 6, y + 3, 5, 8, "#bd9e57");
      p.rect(x + 7, y + 4, 3, 5, "#efda94");
    }
  }
  p.rect(345, area.y + 294, 65, 23, "#886641");
  p.rect(342, area.y + 314, 72, 5, "#c29d61");
  for (const x of [355, 399]) {
    p.ellipse(x, area.y + 323, 17, 17, "#3f4130");
    p.ellipse(x, area.y + 323, 9, 9, "#b99560");
  }
  p.rect(349, area.y + 279, 56, 17, "#c2a159");
  for (let x = 352; x < 405; x += 9)
    p.rect(x, area.y + 276 + (x % 3) * 3, 3, 17, "#e0bf71");
  p.ellipse(124, area.y + 317, 90, 25, "#7c7656");
  p.ellipse(124, area.y + 312, 78, 15, "#527776");
  for (const [x, y] of [
    [151, 346],
    [272, 342],
  ]) {
    p.ellipse(x, area.y + y, 15, 11, "#d1cdb0");
    p.ellipse(x + 7, area.y + y - 5, 8, 8, "#e5dcc0");
    p.rect(x + 5, area.y + y - 12, 4, 4, "#bd7955");
    p.rect(x + 11, area.y + y - 4, 4, 2, "#c8a35b");
    p.rect(x - 3, area.y + y + 4, 2, 5, "#c8a35b");
  }
  if (includeActors) farmActors(p, area);
  farmFence(p, area, true);
}

function riverY(area, x) {
  return (
    area.y +
    area.height * 0.52 +
    Math.sin(x * 0.011) * Math.min(13, area.height * 0.12)
  );
}

function river(p, area) {
  const half = Math.min(52, area.height * 0.3);
  const upper = [],
    lower = [],
    innerUpper = [],
    innerLower = [];
  for (let x = -20; x <= 980; x += 20) {
    const y = riverY(area, x);
    upper.push([x, y - half - 12]);
    lower.push([x, y + half + 12]);
    innerUpper.push([x, y - half]);
    innerLower.push([x, y + half]);
  }
  p.path([...upper, ...lower.reverse()], "#51604a");
  p.path([...innerUpper, ...innerLower.reverse()], "#284a50");
  for (let x = 0; x < WIDTH; x += 38) {
    const y = riverY(area, x);
    p.rect(x, y - half + 3, 22, 2, "#59796e");
    p.rect(x + 14, y + half - 4, 21, 2, "#45665d");
    if (x % 3 === 0) {
      p.ellipse(x + 10, y + half + 4, 27, 13, "#71786a");
      p.rect(x + 3, y + half + 1, 13, 2, "#a1a38a");
    }
  }
  for (const [x, offset] of [
    [169, -8],
    [226, 9],
    [479, -4],
    [539, 10],
    [766, -12],
    [824, 7],
  ]) {
    const y = riverY(area, x) + offset;
    p.ellipse(x, y + 3, 43, 23, "#1d373b");
    p.ellipse(x, y, 35, 19, "#747e70");
    p.rect(x - 10, y - 5, 17, 3, "#a9ad92");
    p.rect(x - 14, y + 4, 19, 3, "#516655");
  }
  for (const x of [64, 336, 651, 906]) {
    const y = riverY(area, x) + half + 13;
    for (let i = 0; i < 4; i++) {
      p.rect(x + i * 5, y - 13 - (i % 2) * 5, 2, 18, "#84946a");
      p.rect(x + i * 5 - 1, y - 16 - (i % 2) * 5, 4, 7, "#a18a57");
    }
    p.ellipse(x - 8, y + 1, 19, 9, "#4c6650");
  }
}

export function railwayGeometry(area) {
  const tunnel = (x) => ({
    x,
    y: area.y + 134,
    mouthLeft: x - 43,
    mouthRight: x + 44,
    mouthTop: area.y + 88,
    mouthBottom: area.y + 164,
  });
  return {
    points: [
      [0, area.y + 150],
      [960, area.y + 150],
    ],
    leftTunnel: tunnel(80),
    rightTunnel: tunnel(880),
    openAir: { left: 157, right: 803, top: area.y + 20, bottom: area.y + 210 },
  };
}

export function trainState(time, reduced = false) {
  if (reduced) return { frontX: 620, moving: false, phase: 0 };
  const phase = ((time % 64) + 64) % 64;
  const moving = phase >= 6 && phase < 50;
  const frontX =
    phase < 6 ? -40 : phase >= 50 ? 1240 : -40 + ((phase - 6) / 44) * 1280;
  return { frontX: Math.round(frontX / 2) * 2, moving, phase };
}

function tunnelRing(p, tunnel, foregroundOnly = false) {
  scaledAt(p, tunnel.x, tunnel.y, 1, () => {
    const outer = [
      [-77, 30],
      [-71, -23],
      [-48, -62],
      [-10, -75],
      [43, -59],
      [70, -22],
      [78, 30],
    ];
    const inner = [
      [-43, 30],
      [-43, -17],
      [-24, -40],
      [0, -46],
      [27, -37],
      [44, -15],
      [44, 30],
    ];
    if (!foregroundOnly) {
      p.path(inner, "#142425");
      p.path(
        [
          [-33, 30],
          [-30, -13],
          [-14, -29],
          [8, -30],
          [29, -13],
          [31, 30],
        ],
        "#1c2e2d",
      );
    }
    // Joined outer/inner contours form a pixel stone ring with an open mouth.
    p.path(
      [...outer, outer[0], inner[0], ...inner.slice(1).reverse(), inner[0]],
      "#78816b",
    );
    for (const [dx, dy] of [
      [-57, -20],
      [-34, -48],
      [5, -58],
      [39, -35],
      [54, 3],
    ]) {
      p.rect(dx - 5, dy, 16, 8, "#a0a68b");
      p.rect(dx - 5, dy + 6, 16, 2, "#566855");
    }
    for (const dx of [-67, 60]) p.ellipse(dx, 24, 32, 12, "#526c48");
  });
}

function tunnelHill(p, area, left) {
  const map = (x, y) => [left ? 960 - x : x, area.y + y];
  p.path(
    [
      [803, 193],
      [803, 99],
      [830, 40],
      [868, 11],
      [912, 27],
      [943, 10],
      [960, 36],
      [960, 205],
      [911, 193],
      [857, 207],
    ].map(([x, y]) => map(x, y)),
    "#354b3b",
  );
  p.path(
    [
      [814, 178],
      [816, 99],
      [842, 47],
      [875, 28],
      [916, 43],
      [950, 28],
      [960, 58],
      [960, 187],
      [902, 183],
    ].map(([x, y]) => map(x, y)),
    "#556452",
  );
  for (const [x, y] of [
    [842, 46],
    [917, 57],
    [948, 112],
    [929, 184],
  ]) {
    const [xx, yy] = map(x, y);
    p.ellipse(xx, yy, 22, 10, "#87907b");
    p.rect(xx - 7, yy - 3, 12, 2, "#a0a38c");
  }
  for (const [x, y] of [
    [815, 181],
    [953, 157],
  ]) {
    const [xx, yy] = map(x, y);
    p.ellipse(xx, yy + 2, 25, 10, "#3d593d");
    for (let i = 0; i < 4; i++)
      p.path(
        [
          [xx, yy],
          [xx - 12 + i * 7, yy - 15 - (i % 2) * 5],
          [xx - 8 + i * 7, yy - 12],
          [xx + 2, yy],
        ],
        "#70864c",
      );
  }
}

function train(p, area, time, reduced) {
  const state = trainState(time, reduced),
    x = state.frontX,
    y = area.y + 150;
  const { leftTunnel, rightTunnel, openAir } = railwayGeometry(area);
  p.ctx.save();
  p.ctx.beginPath();
  p.ctx.rect(
    openAir.left,
    openAir.top,
    openAir.right - openAir.left,
    openAir.bottom - openAir.top,
  );
  for (const tunnel of [leftTunnel, rightTunnel])
    p.ctx.rect(
      tunnel.mouthLeft,
      tunnel.mouthTop,
      tunnel.mouthRight - tunnel.mouthLeft,
      tunnel.mouthBottom - tunnel.mouthTop,
    );
  p.ctx.clip();
  for (let i = 0; i < 2; i++) {
    const cx = x - 270 + i * 98;
    p.rect(cx, y - 38, 87, 39, i ? "#744d3c" : "#496653");
    p.path(
      [
        [cx - 3, y - 38],
        [cx + 4, y - 43],
        [cx + 81, y - 43],
        [cx + 90, y - 38],
      ],
      "#354940",
    );
    p.rect(cx + 2, y - 1, 83, 6, "#b09057");
    for (let j = 0; j < 4; j++) {
      p.rect(cx + 7 + j * 20, y - 31, 15, 18, "#263b35");
      p.rect(cx + 9 + j * 20, y - 29, 11, 14, "#e1c78d");
      p.rect(cx + 12 + j * 20, y - 29, 2, 14, "#9e8658");
    }
    for (const dx of [19, 68]) trainWheel(p, cx + dx, y + 7, time, reduced);
    p.rect(cx + 87, y - 4, 12, 4, "#88764d");
  }
  p.rect(x - 72, y - 28, 67, 29, "#476552");
  p.rect(x - 70, y - 49, 25, 30, "#76513e");
  p.rect(x - 75, y - 53, 34, 5, "#3c4d40");
  p.rect(x - 65, y - 45, 15, 18, "#e4c990");
  p.rect(x - 57, y - 45, 2, 18, "#9d8457");
  p.ellipse(x - 29, y - 24, 45, 22, "#63816c");
  p.rect(x - 27, y - 56, 11, 34, "#3c4d40");
  p.rect(x - 31, y - 60, 19, 6, "#a3a078");
  p.rect(x - 40, y - 39, 13, 15, "#b99e65");
  p.rect(x - 72, y - 1, 74, 6, "#b89b63");
  p.path(
    [
      [x - 4, y - 1],
      [x + 8, y + 7],
      [x - 5, y + 7],
    ],
    "#8b7951",
  );
  p.rect(x - 4, y - 26, 6, 9, "#efdba0");
  for (const dx of [-56, -23]) trainWheel(p, x + dx, y + 7, time, reduced);
  p.rect(x - 55, y + 6, 34, 3, "#c8b684");
  p.ctx.globalAlpha = 0.45;
  for (let i = 0; i < 5; i++) {
    const rise = reduced ? i * 10 : (time * 15 + i * 16) % 75;
    p.ellipse(
      x - 22 - rise * 0.55,
      y - 65 - rise * 0.45,
      12 + rise * 0.35,
      8 + rise * 0.14,
      "#a1b1a0",
    );
  }
  p.ctx.restore();
  // Repaint masonry around the mouth after the train; its hole remains open.
  tunnelRing(p, leftTunnel, true);
  tunnelRing(p, rightTunnel, true);
}

function trainWheel(p, x, y, time, reduced) {
  p.ellipse(x, y, 15, 15, "#263a32");
  p.ellipse(x, y, 9, 9, "#a4a385");
  const angle = reduced ? 0 : time * 2;
  p.rect(
    x + Math.cos(angle) * 3 - 1,
    y + Math.sin(angle) * 3 - 1,
    3,
    3,
    "#e0cf9e",
  );
}

function railway(p, area, includeActors) {
  const y = area.y + 150,
    { leftTunnel, rightTunnel } = railwayGeometry(area);
  p.rect(0, y - 28, 960, 56, "#505a4b");
  for (let x = 0; x < 960; x += 22) {
    p.rect(x, y - 23, 8, 46, "#69513a");
    p.rect(x + 2, y - 20, 3, 40, "#947149");
    p.rect(x - 6, y + 28, 7, 4, "#858775");
  }
  for (const dy of [-13, 13]) {
    p.rect(0, y + dy, 960, 5, "#354743");
    p.rect(0, y + dy, 960, 2, "#9aa799");
  }
  // Outcrops cover the straight bed; only the tunnel floors reveal its rails.
  tunnelHill(p, area, true);
  tunnelHill(p, area, false);
  for (const tunnel of [leftTunnel, rightTunnel]) {
    tunnelRing(p, tunnel);
    for (const dy of [-13, 13])
      p.rect(
        tunnel.mouthLeft,
        y + dy,
        tunnel.mouthRight - tunnel.mouthLeft,
        2,
        "#80968a",
      );
    tunnelRing(p, tunnel, true);
  }
  p.rect(734, area.y + 73, 5, 52, "#8b7954");
  p.rect(729, area.y + 72, 17, 22, "#34473d");
  p.rect(732, area.y + 77, 10, 10, "#8caf76");
  for (const x of [230, 610]) mushroom(p, x, area.y + 218);
  if (includeActors) train(p, area, 0, true);
}

function landmarks(layout) {
  const scenes = layout.invitation
    ? [
        {
          paint: campfire,
          x: 220,
          y: layout.invitation.y + 150,
          rx: 145,
          ry: 150,
        },
      ]
    : [];
  if (layout.stable)
    scenes.push({
      paint: farm,
      x: WIDTH / 2,
      y: layout.stable.y + layout.stable.height / 2,
      rx: WIDTH / 2 + 40,
      ry: layout.stable.height / 2 + 20,
    });
  if (layout.divider)
    scenes.push({
      paint: river,
      x: WIDTH / 2,
      y: layout.divider.y + layout.divider.height / 2,
      rx: WIDTH / 2 + 40,
      ry: layout.divider.height / 2 + 25,
    });
  if (layout.railway)
    scenes.push({
      paint: railway,
      x: WIDTH / 2,
      y: layout.railway.y + layout.railway.height / 2,
      rx: WIDTH / 2 + 40,
      ry: layout.railway.height / 2 + 18,
    });
  return scenes;
}

export function paintJourney(painter, layout, includeActors = true) {
  const p = painter;
  const start = (layout.skyHeight || 0) + 540;
  const scenery = landmarks(layout);
  p.ctx.save();
  // Paint complete canopies across the clearing boundary. Clipping at the
  // ground transition would slice the tops of this first forest row.
  paintGround(
    p,
    {
      x: 0,
      y: start,
      width: WIDTH,
      height: Math.max(0, layout.height - start),
    },
    9031,
  );
  const rand = random(3917);
  for (let i = 0; i < Math.ceil((layout.height - start) / 180); i++) {
    const x = rand() * WIDTH,
      y = start + rand() * Math.max(0, layout.height - start);
    paintFern(p, x, y, 0.7 + rand() * 0.5);
  }
  const trees = [];
  for (let y = start + 35; y < layout.height + 90; y += 62) {
    for (let x = 25; x < WIDTH; x += 54) {
      const tx = x + (rand() - 0.5) * 38,
        ty = y + (rand() - 0.5) * 34;
      const tree = { x: tx, y: ty, s: 0.75 + rand() * 0.45, tone: rand() };
      const footprint = treeFootprint(tree);
      const scenicOpening = scenery.some((scene) =>
        intersects(footprint, {
          left: scene.x - scene.rx,
          right: scene.x + scene.rx,
          top: scene.y - scene.ry,
          bottom: scene.y + scene.ry,
        }),
      );
      if (!scenicOpening) trees.push(tree);
    }
  }
  for (const tree of trees.sort((a, b) => a.y - b.y)) p.tree(tree);
  for (const scene of scenery) {
    if (scene.paint === farm) farm(p, layout.stable, includeActors);
    else if (scene.paint === river) river(p, layout.divider);
    else if (scene.paint === railway) railway(p, layout.railway, includeActors);
    else scene.paint(p, scene.x, scene.y, includeActors);
  }
  p.ctx.restore();
}

// World restores the cached visible band before these small animated overlays.
export function animateJourney(p, layout) {
  const time = p.reduced ? 0 : p.time;
  const viewport = p.viewport || { top: 0, bottom: layout.height };
  for (const scene of landmarks(layout)) {
    if (
      scene.y + scene.ry < viewport.top ||
      scene.y - scene.ry > viewport.bottom
    )
      continue;
    const { x, y } = scene;
    p.ctx.save();
    if (scene.paint === campfire) {
      const flicker = p.reduced ? 0 : Math.floor(time * 5) % 3;
      p.path(
        [
          [x - 13, y + 15],
          [x - 14, y - 3],
          [x - 5, y + 1],
          [x + 3, y - 27],
          [x + 10, y - 7],
          [x + 14, y + 15],
        ],
        ["#f0bb64", "#edaa53", "#f4c975"][flicker],
      );
      p.path(
        [
          [x - 5, y + 15],
          [x - 3, y - 3 - flicker * 2],
          [x + 3, y - 12 - flicker * 2],
          [x + 7, y + 15],
        ],
        "#ffe1a0",
      );
      for (let i = 0; i < 5; i++) {
        const rise = p.reduced ? i * 9 : (time * 18 + i * 17) % 70;
        p.rect(
          x + Math.sin(time * 0.7 + i * 2) * 15,
          y - 19 - rise,
          2,
          3,
          "#d6ab64",
        );
      }
    } else if (scene.paint === farm) {
      farmActors(p, layout.stable, time);
    } else if (scene.paint === railway) {
      train(p, layout.railway, time, p.reduced);
    } else if (scene.paint === river) {
      const area = layout.divider;
      for (let i = 0; i < 30; i++) {
        const rx = ((p.reduced ? 0 : time * 13) + i * 41) % WIDTH;
        const ry =
          riverY(area, rx) +
          Math.sin(i * 2.7) * Math.min(29, area.height * 0.2);
        const onRock = [
          [169, -8],
          [226, 9],
          [479, -4],
          [539, 10],
          [766, -12],
          [824, 7],
        ].some(
          ([rockX, offset]) =>
            Math.abs(rx - rockX) < 26 &&
            Math.abs(ry - riverY(area, rockX) - offset) < 15,
        );
        if (!onRock)
          p.rect(rx, ry, 10 + (i % 4) * 4, 2, i % 3 ? "#527c7c" : "#79a29b");
      }
      for (let i = 0; i < 6; i++) {
        const fx = 83 + i * 151 + Math.sin(time * 0.6 + i) * 9;
        const fy =
          riverY(area, fx) -
          Math.min(49, area.height * 0.3) -
          6 +
          Math.cos(time * 0.5 + i) * 5;
        p.ctx.globalAlpha = p.reduced
          ? 0.55
          : 0.4 + (Math.sin(time + i) + 1) * 0.2;
        p.rect(fx, fy, 2, 2, "#d4d895");
      }
    }
    p.ctx.restore();
  }
}

export function journeyGeometry(layout) {
  return landmarks(layout).map(({ paint, x, y, rx, ry }) => ({
    kind: paint.name,
    x,
    y,
    rx,
    ry,
  }));
}

export function treeFootprint(tree) {
  return {
    left: tree.x - (46 * tree.s + 8),
    right: tree.x + (46 * tree.s + 8),
    top: tree.y - Math.max(80 * tree.s + 6, 68 * tree.s + 22),
    bottom: tree.y + 12,
  };
}

export function intersects(a, b) {
  return (
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
  );
}
