import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base = process.env.BASE_URL || 'http://127.0.0.1:4211';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const width of (process.env.INTERACTIONS_ONLY ? [] : [320, 360, 390, 430])) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
    for (const locale of ['en', 'zh-hant', 'ja']) {
      await page.goto(`${base}/${locale}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.lh-home[data-home-state="open"]', { timeout: 60000 });
      for (const id of ['top', 'ola', 'products', 'films', 'experiences', 'safety', 'family', 'join']) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        await page.waitForTimeout(250);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}/${locale}/${id}: overflow`);
      }
      const hero = await page.locator('#hero-title').boundingBox();
      assert(hero.x >= 0 && hero.x + hero.width <= width, 'hero title fits');
      const card = await page.locator('.lh-film-card').boundingBox();
      assert(card.x >= 0 && card.x + card.width <= width, 'video fits');
      assert.equal(await page.locator('.lh-products').getAttribute('data-carousel'), 'false');
      console.log(`${width}/${locale}: eight sections fit`);
    }
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  for (const route of ['products', 'products/tablet', 'products/ola', 'products/ola-go', 'products/nest', 'products/print', 'plans', 'story', 'media', 'faq', 'contact', 'about', 'legal/privacy']) {
    const response = await page.goto(`${base}/en/${route}`, { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200, route);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route}: overflow`);
  }
  await page.goto(`${base}/en`);
  await page.waitForSelector('.lh-home[data-home-state="open"]', { timeout: 60000 });
  await page.locator('.site-mobile-trigger').click();
  assert(await page.locator('.site-mobile-menu').isVisible(), 'menu opens');
  await page.locator('.site-mobile-close').click();
  await page.locator('#products').scrollIntoViewIfNeeded();
  await page.locator('[data-products-next]').click();
  await page.waitForTimeout(900);
  assert.equal(await page.locator('#products').getAttribute('data-active-product'), '1', 'product next button');
  await page.locator('#films').scrollIntoViewIfNeeded();
  const swipe = async (x, y) => {
    await page.locator('.lh-films-stage').evaluate((target, [x, y]) => {
      const touch = (clientX, clientY) => new Touch({ identifier: 1, target, clientX, clientY });
      target.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [touch(200, 500)] }));
      target.dispatchEvent(new TouchEvent('touchend', { bubbles: true, changedTouches: [touch(x, y)] }));
    }, [x, y]);
    await page.waitForTimeout(900);
  };
  const first = await page.locator('.lh-film-card').getAttribute('aria-label');
  await swipe(205, 350);
  assert.equal(await page.locator('.lh-film-card').getAttribute('aria-label'), first, 'vertical swipe must not switch film');
  await swipe(90, 490);
  assert.notEqual(await page.locator('.lh-film-card').getAttribute('aria-label'), first, 'horizontal swipe switches film');
  await page.locator('.lh-film-toggle').click();
  await page.waitForFunction(() => !document.querySelector('.lh-film-card video').paused);
  await page.locator('.lh-film-toggle').click();
  assert(await page.locator('.lh-film-card video').evaluate(v => v.paused), 'pause is reachable');
  console.log('13 routes, menu, product controls, swipe directions and playback passed');
} finally { await browser.close(); }
