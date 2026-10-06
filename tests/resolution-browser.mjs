import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ headless: true });
const snapshot = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("[data-world-surface]")]
      .filter((c) => {
        const r = c.getBoundingClientRect();
        return r.bottom > 0 && r.top < innerHeight;
      })
      .map((c) => c.toDataURL())
      .join("|"),
  );
try {
  const page = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
    }),
    errors = [];
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
    [700, 1000],
    [701, 1000],
    [740, 1000],
    [741, 1000],
    [1440, 1000],
    [1440, 768],
    [1440, 900],
  ]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(150);
    const metrics = await page.evaluate(() => {
      const shell = document.querySelector(".shell").getBoundingClientRect(),
        canvases = [...document.querySelectorAll("[data-world-surface]")];
      const maxHeight = Math.ceil(
        Math.max(
          1024,
          document.querySelector(".sky-header").getBoundingClientRect().height /
            (shell.width / 960) +
            540,
        ) / 2,
      );
      let transparent = 0;
      for (const canvas of canvases) {
        const data = canvas
          .getContext("2d")
          .getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 3; i < data.length; i += 4)
          if (data[i] !== 255) transparent++;
      }
      window.testSurfaces = canvases;
      window.testPositions = canvases.map((c) => c.style.top);
      const readingFits = [
        ...document.querySelectorAll(".reading-section"),
      ].every((el) => {
        const r = el.getBoundingClientRect();
        return r.left >= shell.left - 0.1 && r.right <= shell.right + 0.1;
      });
      const textFits = [
        ...document.querySelectorAll(
          ".reading-section p,.reading-section h2,.reading-section h3,.reading-section h4,.reading-section small,.reading-section .tags span",
        ),
      ].every((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return [...range.getClientRects()].every(
          (r) => r.left >= shell.left - 0.1 && r.right <= shell.right + 0.1,
        );
      });
      return {
        readingFits,
        textFits,
        columns: getComputedStyle(
          document.querySelector(".portfolio-reading"),
        ).gridTemplateColumns.split(" ").length,
        left: shell.left,
        width: shell.width,
        overflow: document.documentElement.scrollWidth > innerWidth,
        transparent,
        count: canvases.length,
        bounded: canvases.every((c) => c.height <= maxHeight),
      };
    });
    assert.ok(Math.abs(metrics.width - Math.min(1120, width)) < 0.02);
    assert.ok(Math.abs(metrics.left - (width - metrics.width) / 2) < 0.02);
    assert.equal(metrics.overflow, false);
    if (width >= 1440 || width <= 390) {
      const opening = await page.evaluate(() => {
        const rect = (s) => document.querySelector(s).getBoundingClientRect();
        return {
          boardBottom: rect(".reading-invitation").bottom,
          controlsBottom: rect(".keyboard-hint").bottom,
          controlsCenter:
            (rect(".keyboard-hint").left + rect(".keyboard-hint").right) / 2,
          boardInset: [
            ...document.querySelectorAll(".reading-invitation a > *"),
          ].every((e) => {
            const a = rect(".reading-invitation a"),
              b = e.getBoundingClientRect();
            return (
              b.left >= a.left + 10 &&
              b.right <= a.right - 10 &&
              b.top >= a.top + 20 &&
              b.bottom <= a.bottom - 20
            );
          }),
          portraitTop: rect(".identity img").top,
          socialInGame: !!document.querySelector(".game-frame .social-links"),
          touchClear: [...document.querySelectorAll(".touch-pad button")].every(
            (button) => {
              if (
                getComputedStyle(button).display === "none" ||
                !button.getClientRects().length
              )
                return true;
              const a = button.getBoundingClientRect(),
                b = rect(".identity h1");
              return (
                a.right <= b.left ||
                a.left >= b.right ||
                a.bottom <= b.top ||
                a.top >= b.bottom
              );
            },
          ),
        };
      });
      assert.ok(opening.controlsBottom < opening.portraitTop);
      assert.ok(Math.abs(opening.controlsCenter - width / 2) < 1);
      assert.ok(
        opening.boardInset,
        "Reading sign content must stay inset within its wood face",
      );
      assert.ok(opening.socialInGame);
      assert.ok(
        opening.touchClear,
        "Touch controls must not cover the owner's name",
      );
    }

    assert.ok(
      metrics.readingFits && metrics.textFits,
      `Reading text must not clip at ${width}px`,
    );
    assert.equal(metrics.columns, width > 850 ? 2 : 1);
    assert.equal(
      metrics.transparent,
      0,
      `All prepainted scenery must remain opaque at ${width}px`,
    );
    assert.ok(metrics.count > 1 && metrics.bounded);
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    assert.ok(
      await page.evaluate(() =>
        window.testSurfaces.every(
          (c, i) =>
            c === document.querySelectorAll("[data-world-surface]")[i] &&
            c.style.top === window.testPositions[i],
        ),
      ),
      "Scroll must not move or recreate render surfaces",
    );
    await page.waitForTimeout(100);
    const before = await snapshot(page);
    await page.waitForTimeout(700);
    assert.ok(
      (await snapshot(page)) !== before,
      "Stationary surfaces must keep animating",
    );
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(100);
  const still = await snapshot(page);
  await page.waitForTimeout(700);
  assert.ok((await snapshot(page)) === still);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForTimeout(700);
  assert.ok((await snapshot(page)) !== still);
  assert.deepEqual(errors, []);
  console.log(
    "Resolution verification passed: fixed scene compositions, prepainted stationary surfaces, instant scroll coverage, live animation, and reduced-motion recovery at 320–3440px.",
  );
} finally {
  await browser.close();
}
