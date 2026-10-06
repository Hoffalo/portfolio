function seeded(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
// Authoring-time Voronoi terrain; no region search occurs in animation frames.
export function paintGround(p, area, seed = 9031) {
  const { x = 0, y = 0, width, height } = area;
  const cell = 70,
    pixel = 8;
  const left = Math.floor(x / cell) - 1,
    top = Math.floor(y / cell) - 1;
  const cols = Math.ceil((x + width) / cell) - left + 2;
  const rows = Math.ceil((y + height) / cell) - top + 2;
  const palette = [
    "#263a2e",
    "#2b3d30",
    "#29392c",
    "#23362d",
    "#303d2e",
    "#283b2d",
    "#2b3b2b",
  ];
  const sites = [];
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < cols; col++) {
      const gx = left + col,
        gy = top + row;
      const rand = seeded(
        (seed ^ Math.imul(gx, 374761393) ^ Math.imul(gy, 668265263)) >>> 0,
      );
      sites.push({
        x: (gx + 0.2 + rand() * 0.6) * cell,
        y: (gy + 0.2 + rand() * 0.6) * cell,
        color: palette[Math.floor(rand() * palette.length)],
        moss: rand(),
      });
    }
  for (let py = y; py < y + height; py += pixel)
    for (let px = x; px < x + width; px += pixel) {
      const gx = Math.floor(px / cell) - left,
        gy = Math.floor(py / cell) - top;
      let nearest = null,
        distance = Infinity;
      for (let oy = -1; oy <= 1; oy++)
        for (let ox = -1; ox <= 1; ox++) {
          const site = sites[(gy + oy) * cols + gx + ox];
          if (!site) continue;
          const d = (site.x - px) ** 2 + (site.y - py) ** 2;
          if (d < distance) {
            distance = d;
            nearest = site;
          }
        }
      p.rect(
        px,
        py,
        Math.min(pixel, x + width - px),
        Math.min(pixel, y + height - py),
        nearest.color,
      );
    }
  // Speckled humus, tiny moss clusters and scattered slate remain subtle.
  const rand = seeded(seed);
  const count = Math.ceil((width * height) / 700);
  for (let i = 0; i < count; i++) {
    const px = x + rand() * width,
      py = y + rand() * height;
    const color = i % 5 === 0 ? "#53614a" : i % 3 === 0 ? "#46503d" : "#3a4c35";
    p.rect(px, py, 2 + rand() * 4, 2, color);
    if (i % 4 === 0) {
      p.rect(px + 2, py - 2, 2, 2, "#526042");
      p.rect(px + 4, py + 2, 2, 2, "#344e35");
    }
    if (i % 7 === 0) {
      p.rect(px - 2, py + 2, 4, 2, "#635c43");
      p.rect(px, py, 2, 2, "#827154");
    }
  }
}
export function paintFern(p, x, y, size = 1) {
  p.rect(x, y - 15 * size, 2, 18 * size, "#60734a");
  for (let branch = 0; branch < 4; branch++) {
    const yy = y - 3 - branch * 4 * size,
      reach = (9 - branch * 1.5) * size;
    for (const side of [-1, 1]) {
      for (let step = 0; step < 3; step++) {
        p.rect(
          x + side * (reach - step * 3 * size),
          yy - (2 - step) * 2 * size,
          3 * size,
          2,
          branch % 2 ? "#637b4b" : "#4b6a42",
        );
      }
    }
  }
  p.rect(x - 2, y - 18 * size, 4, 3 * size, "#7f8f57");
}
