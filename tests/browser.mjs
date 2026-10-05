import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ headless: true });
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(process.env.TEST_URL || "http://localhost:5173");
  for (const id of ["projects", "career", "gamedev", "about"]) {
    const button = page.locator(`[data-area="${id}"]`);
    await button.click();
    assert.equal(await page.locator("#panel").evaluate((el) => el.open), true);
    assert.ok(await page.locator("#panel-title").textContent());
    await page.keyboard.press("Escape");
    assert.equal(
      await button.evaluate((el) => el === document.activeElement),
      true,
    );
  }
  assert.equal(await page.locator("h1").textContent(), "Issam Arida");
  assert.equal(
    await page.locator(".email-link").getAttribute("href"),
    "mailto:issamaarida@gmail.com",
  );
  assert.equal(
    await page
      .locator(".identity img")
      .evaluate((el) => el.complete && el.naturalWidth > 0),
    true,
  );
  assert.deepEqual(
    await page
      .locator(".reading-section> .section-heading h2")
      .allTextContents(),
    ["About", "Projects", "Career", "Game Dev"],
  );
  assert.equal(await page.locator(".destinations, .progress").count(), 0);
  for (const id of ["about", "projects", "career", "gamedev"]) {
    await page.locator(`[data-area="${id}"]`).click();
    assert.equal(
      await page.locator("#panel-content .section-body").innerText(),
      await page.locator(`#${id} .section-body`).innerText(),
    );
    await page.keyboard.press("Escape");
  }
  await page.locator("#motion").click();
  assert.equal(
    await page.locator("#motion").getAttribute("aria-pressed"),
    "true",
  );
  await page.locator("#world").focus();
  await page.waitForTimeout(50);
  const before = await page.locator("#world").evaluate((el) => el.toDataURL());
  await page.keyboard.down("d");
  await page.waitForTimeout(180);
  await page.keyboard.up("d");
  const after = await page.locator("#world").evaluate((el) => el.toDataURL());
  assert.notEqual(
    after,
    before,
    "Keyboard movement changes the rendered player position",
  );
  await page.locator("#sound").click();
  assert.equal(
    await page.locator("#sound").getAttribute("aria-pressed"),
    "true",
  );
  await page.locator("#sound").click();
  assert.equal(
    await page.locator("#sound").getAttribute("aria-pressed"),
    "false",
  );
  await page.screenshot({ path: "/tmp/midnight-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  assert.equal(await page.locator(".touch-pad").isVisible(), true);
  const box = await page.locator("#world").boundingBox();
  assert.ok(Math.abs(box.width / box.height - 16 / 9) < 0.01);
  await page.locator('[data-area="projects"]').click();
  assert.equal(
    await page
      .locator("#panel")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
    true,
  );
  await page.locator("#close-panel").click();
  await page.screenshot({ path: "/tmp/midnight-mobile.png", fullPage: true });
  const reduced = await browser.newPage({ reducedMotion: "reduce" });
  await reduced.goto(process.env.TEST_URL || "http://localhost:5173");
  assert.equal(
    await reduced.locator("#motion").getAttribute("aria-pressed"),
    "true",
  );
  await reduced.close();
  const plain = await browser.newPage({ javaScriptEnabled: false });
  await plain.goto(process.env.TEST_URL || "http://localhost:5173");
  assert.equal(await plain.locator(".reading-section").count(), 4);
  await plain.locator(".reading-invitation a").click();
  assert.equal(new URL(plain.url()).hash, "#about");
  assert.equal(await plain.locator("#projects .project-card").count(), 4);
  await plain.close();
  assert.deepEqual(errors, []);
  console.log(
    "Browser verification passed: 4 destinations, focus return, Escape, shared static reading content and portrait, sound, reduced motion, mobile layout, and no runtime errors.",
  );
} finally {
  await browser.close();
}
