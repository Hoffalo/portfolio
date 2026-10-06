import { writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

// Bake the same world renderer into a static fallback for readers without JavaScript.
// Run with the local preview running. This is an authoring tool, not a deployment build.
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  await page.goto(process.env.ART_URL || "http://localhost:5173");
  await page.evaluate(() => document.fonts.ready);
  const data = await page.evaluate(async () => {
    const { World } = await import("./world.js");
    const root = document.querySelector("#journey-world"),
      box = root.getBoundingClientRect(),
      scale = box.width / 960;
    const sections = [...document.querySelectorAll(".reading-section")].map(
      (section) => {
        const rect = section.getBoundingClientRect();
        return {
          id: section.id,
          x: (rect.left - box.left) / scale,
          y: (rect.top - box.top) / scale,
          width: rect.width / scale,
          height: rect.height / scale,
        };
      },
    );
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 270;
    const painter = new World(canvas, () => {});
    painter.setLayout({
      height: Math.ceil(box.height / scale / 2) * 2,
      sections,
      mobile: false,
    });
    return painter.scene.toDataURL("image/png").split(",")[1];
  });
  await writeFile("dist/art/journey.png", Buffer.from(data, "base64"));
  console.log(
    "Generated continuous woodland fallback from the live world renderer.",
  );
} finally {
  await browser.close();
}
