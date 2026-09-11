import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto('http://127.0.0.1:4211/en');
  await page.waitForTimeout(8000);
  const target = await page.locator('.lh-products-stage').evaluate(el => scrollY + el.getBoundingClientRect().top);
  await page.evaluate(y => scrollTo({ top: y - 40, behavior: 'instant' }), target);
  await page.mouse.move(30, 450);
  await page.mouse.wheel(0,100);
  await page.waitForTimeout(300);
  const landed=await page.evaluate(()=>scrollY);
  assert(landed>target+40,'wheel advances normally across landing');
  assert(Math.abs((await page.locator('.lh-products-stage').boundingBox()).y)<3,'complete floor remains visible');
  await page.waitForTimeout(900);
  assert(Math.abs(await page.evaluate(()=>scrollY)-landed)<2,'no automatic snap after wheel stops');
  await page.mouse.wheel(0,120);
  await page.waitForTimeout(250);
  assert(await page.evaluate(()=>scrollY)>landed+100,'first wheel consumes real scroll distance');
  assert(Math.abs((await page.locator('.lh-products-stage').boundingBox()).y)<3,'first wheel remains on floor');
  await page.mouse.wheel(0,120);
  await page.waitForTimeout(250);
  assert((await page.locator('.lh-products-stage').boundingBox()).y < -30,'second wheel leaves floor');
  const released=await page.evaluate(()=>scrollY);
  await page.waitForTimeout(900);
  assert(Math.abs(await page.evaluate(()=>scrollY)-released)<2,'no forced backward movement');
  await page.locator('.lh-films-stage').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const before = await page.evaluate(() => scrollY);
  await page.locator('.lh-film-card').hover();
  await page.mouse.wheel(0, 150);
  await page.waitForTimeout(900);
  assert.equal(await page.locator('.lh-film-card').getAttribute('aria-label'), '2 / 3', 'film wheel still switches videos');
  assert(Math.abs(await page.evaluate(() => scrollY) - before) < 3, 'film wheel does not move page');
  console.log('Native landing distance, two-wheel release, no snap-back and film wheel checks passed.');
} finally {
  await browser.close();
}
