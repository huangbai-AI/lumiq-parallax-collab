import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const open = async (options = {}) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, ...options });
  return page;
};
try {
  const fallback = await open();
  await fallback.route('**/background-scroll-v1.mp4', route => route.abort());
  await fallback.goto('http://127.0.0.1:4211/en');
  await fallback.waitForTimeout(3000);
  assert.equal(await fallback.locator('[data-background-video]').evaluate(v => v.dataset.ready), 'false');
  assert.equal(await fallback.locator('[data-chapter-background="products"]').evaluate(el => el.style.opacity), '1');
  await fallback.close();
  const reduced = await open({ reducedMotion: 'reduce' });
  await reduced.goto('http://127.0.0.1:4211/en');
  await reduced.waitForTimeout(1500);
  assert.equal(await reduced.locator('[data-background-video]').getAttribute('src'), null);
  await reduced.close();
  if (!process.argv.includes('--fallback-only')) {
    const page = await open();
    await page.goto('http://127.0.0.1:4211/en');
    await page.waitForSelector('[data-background-video][data-ready="true"]', { state: 'attached', timeout: 30000 });
    await page.waitForTimeout(6000);
    const positions = await page.evaluate(() => {
      const top = selector => scrollY + document.querySelector(selector).getBoundingClientRect().top;
      const nav = document.querySelector('.site-nav').getBoundingClientRect().height;
      return [top('.lh-products-stage'), top('.lh-films-layout') - nav, top('.lh-room-layout') - nav];
    });
    const video = page.locator('[data-background-video]');
    const move = async (y, time) => {
      await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y);
      await page.waitForFunction(time => {
        const v = document.querySelector('[data-background-video]');
        return !v.seeking && Math.abs(v.currentTime - time) < .15;
      }, time);
      assert(await video.evaluate(v => v.paused), 'background remains paused');
    };
    await move(positions[0], 4);
    assert.equal(await page.locator('[data-chapter-background="products"]').evaluate(el => el.style.opacity), '0');
    await move((positions[0] + positions[1]) / 2, 6);
    await page.waitForTimeout(500);
    assert(Math.abs(await video.evaluate(v => v.currentTime) - 6) < .15, 'stopped scroll freezes frame');
    await move(positions[1], 8);
    await move(positions[2], await video.evaluate(v => Math.min(12, v.duration - 1 / 30)));
    await move(positions[0], 4);
    assert.equal(await page.locator('[data-background-video]').count(), 1);
    await page.screenshot({ path: '/tmp/lumiq-background-products.png' });
    await page.close();
  }
  console.log('PASS background fallback/reduced-motion' + (process.argv.includes('--fallback-only') ? '' : ', chapter cues, seek/freeze/reverse and single video'));
} finally { await browser.close(); }
