import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto('http://127.0.0.1:4211/en');
  await page.waitForTimeout(8000);
  const target = await page.locator('.lh-products-stage').evaluate(el => scrollY + el.getBoundingClientRect().top);
  await page.evaluate(y => scrollTo({ top: y - 200, behavior: 'instant' }), target);
  await page.mouse.move(30, 450);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(780);
  assert(Math.abs(await page.evaluate(() => scrollY) - target) < 3, 'land on the complete product floor');
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(100);
  assert(Math.abs(await page.evaluate(() => scrollY) - target) < 3, 'hold briefly after landing');
  await page.waitForTimeout(650);
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(150);
  assert(await page.evaluate(() => scrollY) > target + 100, 'new gesture continues down');
  await page.locator('.lh-films-stage').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const before = await page.evaluate(() => scrollY);
  await page.locator('.lh-film-card').hover();
  await page.mouse.wheel(0, 150);
  await page.waitForTimeout(900);
  assert.equal(await page.locator('.lh-film-card').getAttribute('aria-label'), '2 / 3', 'film wheel still switches videos');
  assert(Math.abs(await page.evaluate(() => scrollY) - before) < 3, 'film wheel does not move page');
  console.log('Product landing, 550ms pause, resume and film wheel checks passed.');
} finally {
  await browser.close();
}
