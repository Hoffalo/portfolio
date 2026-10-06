import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(process.env.TEST_URL || "http://localhost:5173");
  await page.evaluate(() => document.fonts.ready);
  for (const [width, height] of [
    [1920, 1080],
    [2560, 1440],
    [3440, 1440],
    [320, 844],
    [390, 844],
    [500, 1000],
    [600, 1000],
    [700, 1000],
    [701, 1000],
    [740, 1000],
    [741, 1000],
    [1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(150);
    const metrics = await page.evaluate(() => {
      const canvas = document.querySelector("#world"),
        shell = document.querySelector(".shell").getBoundingClientRect();
      const visibleRows = Math.min(
        canvas.height,
        Math.ceil(
          (innerHeight - canvas.getBoundingClientRect().top) /
            (shell.width / canvas.width),
        ),
      );
      const data = canvas
        .getContext("2d")
        .getImageData(0, 0, canvas.width, visibleRows).data;
      let transparent = 0;
      for (let i = 3; i < data.length; i += 4)
        if (data[i] !== 255) transparent++;
      return {
        transparent,
        left: shell.left,
        right: shell.right,
        width: innerWidth,
        sceneryWidth: shell.width,
        overflow: document.documentElement.scrollWidth > innerWidth,
        backingHeight: canvas.height,
        limit: Math.ceil((innerHeight * 960) / shell.width / 2) + 24,
        pixels: [
          ...canvas
            .getContext("2d")
            .getImageData(0, 0, canvas.width, canvas.height).data,
        ].some((value) => value !== 0),
      };
    });
    assert.equal(metrics.sceneryWidth, Math.min(1440, metrics.width));
    assert.equal(metrics.left, (metrics.width - metrics.sceneryWidth) / 2);
    assert.equal(metrics.right, (metrics.width + metrics.sceneryWidth) / 2);
    assert.equal(metrics.overflow, false);
    assert.equal(
      metrics.transparent,
      0,
      `Visible scenery must have no transparent seams at ${width}px`,
    );
    assert.ok(
      metrics.backingHeight <= metrics.limit,
      "Animation buffer must stay viewport-sized",
    );
    assert.ok(metrics.pixels, "Resized canvas must render scenery");
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(100);
    const before = await page
      .locator("#world")
      .evaluate((el) => el.toDataURL());
    await page.waitForTimeout(700);
    assert.ok(
      (await page.locator("#world").evaluate((el) => el.toDataURL())) !==
        before,
      "Animation must continue after resize and scroll",
    );
  }
  // Rapid viewport changes must settle into a live, aligned renderer.
  for (const width of [1800, 2100, 2200, 1700, 2400, 1920])
    await page.setViewportSize({ width, height: 1080 });
  await page.waitForTimeout(200);
  const live = await page.locator("#world").evaluate((el) => el.toDataURL());
  await page.waitForTimeout(700);
  assert.ok(
    (await page.locator("#world").evaluate((el) => el.toDataURL())) !== live,
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(100);
  const frozen = await page.locator("#world").evaluate((el) => el.toDataURL());
  await page.waitForTimeout(700);
  assert.equal(
    await page.locator("#world").evaluate((el) => el.toDataURL()),
    frozen,
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForTimeout(700);
  assert.notEqual(
    await page.locator("#world").evaluate((el) => el.toDataURL()),
    frozen,
  );
  assert.deepEqual(errors, []);
  console.log(
    "Resolution verification passed: centered scenery at 320–3440px, bounded canvas memory, live resize/scroll animation, reduced-motion resume, and no rendering errors.",
  );
} finally {
  await browser.close();
}
