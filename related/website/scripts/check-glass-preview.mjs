import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("http://127.0.0.1:4211/en/glass-preview");
  await page.locator(".glass-sample-content").first().waitFor({ timeout: 60000 });
  assert.equal(await page.locator(".glass-sample-content").count(), 3);
  const go = page.locator(".glass-preview-controls button").filter({ hasText: "LumiQ Go" });
  await go.click();
  assert.equal(await page.locator(".glass-sample-content").first().getAttribute("aria-pressed"), "true");
  assert.match(await page.locator(".glass-sample-content").first().innerText(), /70%/);
  await page.getByRole("button", { name: "侧面查看厚度" }).click();
  assert.equal(await page.getByRole("button", { name: "侧面查看厚度" }).getAttribute("aria-pressed"), "true");
  await page.getByRole("button", { name: "只看玻璃" }).click();
  assert.equal(await page.locator(".glass-sample-content").count(), 0);
  assert.deepEqual(errors, []);
  console.log("Glass preview: render, selection, side-view and bare-glass controls passed.");
} finally {
  await browser.close();
}
