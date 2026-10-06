import { writeFile } from "node:fs/promises";
import { deflateSync } from "node:zlib";
import { World } from "../dist/world.js";

// Rasterize the game's own tree renderer into static page-border tiles.
// This small context only implements the rectangle transforms used by pixel art.
class PixelContext {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.pixels = Buffer.alloc(width * height * 4);
    this.fillStyle = "#000000";
    this.transform = [0.5, 0.5, 0, 0];
    this.stack = [];
  }
  save() {
    this.stack.push([this.fillStyle, [...this.transform]]);
  }
  restore() {
    [this.fillStyle, this.transform] = this.stack.pop();
  }
  translate(x, y) {
    this.transform[2] += x * this.transform[0];
    this.transform[3] += y * this.transform[1];
  }
  fillRect(x, y, width, height) {
    const [sx, sy, tx, ty] = this.transform;
    const color = this.fillStyle
      .match(/[a-f0-9]{2}/gi)
      .map((part) => parseInt(part, 16));
    for (
      let py = Math.max(0, Math.round(y * sy + ty));
      py < Math.min(this.height, Math.round((y + height) * sy + ty));
      py++
    )
      for (
        let px = Math.max(0, Math.round(x * sx + tx));
        px < Math.min(this.width, Math.round((x + width) * sx + tx));
        px++
      ) {
        const index = (py * this.width + px) * 4;
        this.pixels[index] = color[0];
        this.pixels[index + 1] = color[1];
        this.pixels[index + 2] = color[2];
        this.pixels[index + 3] = 255;
      }
  }
}
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}
async function savePNG(filename, context) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(context.width, 0);
  header.writeUInt32BE(context.height, 4);
  header[8] = 8;
  header[9] = 6;
  const rows = [];
  for (let y = 0; y < context.height; y++)
    rows.push(
      Buffer.from([0]),
      context.pixels.subarray(
        y * context.width * 4,
        (y + 1) * context.width * 4,
      ),
    );
  await writeFile(
    filename,
    Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk("IHDR", header),
      chunk("IDAT", deflateSync(Buffer.concat(rows))),
      chunk("IEND", Buffer.alloc(0)),
    ]),
  );
}
function random(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
function renderer(width, height) {
  const painter = Object.create(World.prototype);
  painter.ctx = new PixelContext(width, height);
  painter.time = 0;
  painter.reduced = true;
  return painter;
}
for (const [side, seed] of [
  ["left", 192],
  ["right", 834],
]) {
  const painter = renderer(96, 480),
    rand = random(seed);
  const trees = [];
  for (let row = 0; row < 13; row++) {
    const y = 30 + row * 76;
    trees.push({
      x: side === "left" ? 25 : 166,
      y: y - 12,
      s: 1.12,
      tone: rand(),
    });
    trees.push({
      x: 76 + rand() * 35,
      y: y + 22,
      s: 0.78 + rand() * 0.38,
      tone: rand(),
    });
  }
  trees.sort((a, b) => a.y - b.y).forEach((tree) => painter.tree(tree));
  for (let i = 0; i < 35; i++) {
    const x = rand() * 185,
      y = rand() * 960;
    painter.rect(x, y, 4, 3, "#465a38");
    painter.rect(x + 5, y - 3, 3, 5, "#31492f");
    if (i % 5 === 0) {
      painter.rect(x, y + 7, 3, 5, "#8a7b53");
      painter.rect(x - 3, y + 5, 9, 4, "#875644");
    }
  }
  await savePNG(`dist/art/forest-${side}.png`, painter.ctx);
}
const ground = renderer(96, 96),
  rand = random(2408);
ground.rect(0, 0, 192, 192, "#292820");
const soil = ["#25251e", "#302d23", "#343025", "#22241e", "#2b2e23"];
for (let i = 0; i < 360; i++)
  ground.rect(
    rand() * 192,
    rand() * 192,
    2 + rand() * 8,
    2 + rand() * 4,
    soil[i % soil.length],
  );
for (const [x, y, ore, shine] of [
  [24, 32, "#51605a", "#75877b"],
  [133, 119, "#6b523d", "#957657"],
  [67, 168, "#596345", "#7a8255"],
]) {
  ground.rect(x - 3, y - 3, 19, 12, "#222720");
  ground.rect(x, y, 7, 5, ore);
  ground.rect(x + 8, y + 4, 5, 4, ore);
  ground.rect(x + 2, y, 3, 2, shine);
}
await savePNG("dist/art/dirt-ore.png", ground.ctx);
console.log(
  "Generated static forest borders and dirt/ore tile from the pixel renderer.",
);
