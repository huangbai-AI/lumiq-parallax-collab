import assert from "node:assert/strict";
import { chromium } from "playwright";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("http://127.0.0.1:4211/en");
  await page.locator(".lh-glass-products canvas").waitFor({ timeout: 60000 });
  await page.locator("#products").scrollIntoViewIfNeeded();
  await page.locator(".lh-glass-products a").first().waitFor();
  await page.waitForTimeout(1200);
  assert.equal(await page.locator(".lh-products-viewport").isVisible(), false);
  const names = new Set();
  for (let i = 0; i < 5; i++) {
    const link = page.locator('.lh-glass-products [data-active="true"] a');
    names.add(await link.getAttribute("href"));
    assert.match(await link.getAttribute("href"), /^\/en\/products\//);
    assert.equal(await page.locator(".lh-glass-products a").count(), 3);
    await page.locator("[data-products-next]").click();
    await page.waitForTimeout(750);
  }
  assert.equal(names.size, 5, "All five products remain reachable");
  await page.screenshot({ path: "/tmp/lumiq-home-glass-final.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  assert.equal(await page.locator(".lh-products-viewport").isVisible(), true);
  assert.equal(await page.locator(".lh-glass-products canvas").count(), 0);
  assert.equal(await page.locator(".lh-product-slot a").count(), 5);
  assert.deepEqual(errors, []);
  console.log("Home glass: five-product cycle, localized links, desktop material, mobile fallback and no runtime errors passed.");
} finally { await browser.close(); }
