import {expect, test} from '@playwright/test';

test('carousel cards have restrained, spatially dispersed color glow', async ({page}, info) => {
  test.skip(info.project.name !== 'desktop', 'desktop carousel glow');
  await page.setViewportSize({width: 1440, height: 900});
  await page.goto('/en/products#lineup');

  const glowColors = async (selector: string) => page.locator(selector).evaluate((element) =>
    [...getComputedStyle(element).boxShadow.matchAll(/rgba\((\d+), (\d+), (\d+), ([\d.]+)\)([^,]*)/g)]
      .map((match) => match.slice(1, 5).map(Number)),
  );

  for (const slot of ['center', 'previous', 'next']) {
    const colors = (await glowColors(`.prod-slide[data-slot="${slot}"]`))
      .filter(([r, g, b]) => Math.max(r, g, b) - Math.min(r, g, b) > 35 && Math.max(r, g, b) > 100);
    const totalOpacity = colors.reduce((sum, [, , , alpha]) => sum + alpha, 0);
    expect(totalOpacity, `${slot} card color glow should be about half as strong`).toBeLessThan(slot === 'center' ? 1.2 : 0.3);
    expect(totalOpacity, `${slot} card should still have visible color`).toBeGreaterThan(slot === 'center' ? 0.9 : 0.18);
    expect(colors.some(([r, g, b]) => g > r + 35 && b > g + 10), `${slot} card needs a cyan edge`).toBe(true);
    expect(colors.some(([r, g, b]) => r > g + 25 && b > r + 30), `${slot} card needs a violet edge`).toBe(true);
    expect(colors.some(([r, g, b]) => r > b + 20 && b > g + 20), `${slot} card needs a soft pink edge`).toBe(true);
  }
});

test('narrow-screen active card shows colored light inside its visible edges', async ({page}, info) => {
  test.skip(info.project.name !== 'desktop', 'narrow viewport on desktop browser');
  await page.setViewportSize({width: 562, height: 711});
  await page.goto('/en/products#lineup');

  const insetColors = await page.locator('.prod-slide[data-slot="center"]').evaluate((element) =>
    [...getComputedStyle(element).boxShadow.matchAll(/rgba\((\d+), (\d+), (\d+), ([\d.]+)\)[^,]*inset/g)]
      .map((match) => match.slice(1).map(Number)),
  );
  const visibleColoredGlow = insetColors.filter(([r, g, b, alpha]) =>
    Math.max(r, g, b) - Math.min(r, g, b) > 35 && alpha >= 0.1,
  );
  expect(visibleColoredGlow.length).toBeGreaterThanOrEqual(3);
  expect(visibleColoredGlow.reduce((sum, [, , , alpha]) => sum + alpha, 0)).toBeLessThan(0.75);
});

test('product images sit directly on the frosted carousel cards without inner panels', async ({page}, info) => {
  test.skip(info.project.name !== 'desktop', 'desktop carousel cards');
  await page.setViewportSize({width: 1440, height: 900});
  await page.goto('/en/products#lineup');

  const media = page.locator('.prod-slide[data-slot="center"] .prod-stage-media, .prod-slide[data-slot="previous"] .prod-stage-media, .prod-slide[data-slot="next"] .prod-stage-media');
  await expect(media).toHaveCount(3);
  for (const panel of await media.all()) {
    const styles = await panel.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        background: style.backgroundImage,
        backgroundColor: style.backgroundColor,
        borderWidth: style.borderTopWidth,
        shadow: style.boxShadow,
        backdropFilter: style.backdropFilter,
      };
    });
    expect(styles).toEqual({
      background: 'none',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      borderWidth: '0px',
      shadow: 'none',
      backdropFilter: 'none',
    });
  }
});

test('lineup shows side previews and changes only from card interactions', async ({page}, info) => {
  test.skip(info.project.name !== 'desktop', 'desktop card layout');
  await page.setViewportSize({width: 1440, height: 900});
  await page.goto('/en/products#lineup');

  const stage = page.locator('.prod-stage');
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute('data-carousel-ready', 'true');
  await expect(page.locator('.prod-peek')).toHaveCount(2);
  await expect(page.locator('.prod-peek--previous')).toBeVisible();
  await expect(page.locator('.prod-peek--next')).toBeVisible();

  const initial = await stage.getAttribute('aria-labelledby');
  await page.waitForTimeout(5500);
  await expect(stage).toHaveAttribute('aria-labelledby', initial!);

  await stage.hover();
  const scrollBeforeCardWheel = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 120);
  await expect(stage).not.toHaveAttribute('aria-labelledby', initial!);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBeforeCardWheel);

  const afterCardWheel = await stage.getAttribute('aria-labelledby');
  await expect.poll(async () => (await stage.boundingBox())?.width ?? 0).toBeGreaterThan(950);
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const carouselBox = await page.locator('.prod-carousel').boundingBox();
  expect(carouselBox).not.toBeNull();
  await page.mouse.move(carouselBox!.x + carouselBox!.width / 2, carouselBox!.y - 24);
  await page.mouse.wheel(0, 100);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollBefore);
  await expect(stage).toHaveAttribute('aria-labelledby', afterCardWheel!);
});

test('the next card travels into the center with its product image fully visible at the side', async ({page}, info) => {
  test.skip(info.project.name !== 'desktop', 'desktop card animation');
  await page.setViewportSize({width: 1856, height: 1000});
  await page.goto('/en/products#lineup');

  const stage = page.locator('.prod-stage');
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute('data-carousel-ready', 'true');

  const incoming = await page.locator('.prod-peek--next').elementHandle();
  expect(incoming).not.toBeNull();
  const before = await incoming!.boundingBox();
  const stageBefore = await stage.boundingBox();
  const sideImage = await incoming!.waitForElementState('visible').then(() => incoming!.$('img'));
  const imageBefore = await sideImage?.boundingBox();
  expect(before).not.toBeNull();
  expect(stageBefore).not.toBeNull();
  expect(imageBefore).not.toBeNull();
  expect(imageBefore!.x).toBeGreaterThanOrEqual(stageBefore!.x + stageBefore!.width);

  await stage.hover();
  await page.mouse.wheel(0, 120);
  await expect.poll(() => incoming!.evaluate((card) => card.classList.contains('prod-stage'))).toBe(true);
  await page.waitForTimeout(180);
  const midway = await incoming!.boundingBox();
  await page.waitForTimeout(650);
  const after = await incoming!.boundingBox();
  expect(midway).not.toBeNull();
  expect(after).not.toBeNull();
  expect(midway!.x).toBeLessThan(before!.x - 20);
  expect(midway!.x).toBeGreaterThan(after!.x + 20);
  expect(after!.width).toBeGreaterThan(before!.width * 2);
});

test('the active card fills the mobile content width without horizontal overflow', async ({page}, info) => {
  test.skip(info.project.name !== 'desktop', 'mobile viewport on desktop browser');
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/en/products#lineup');
  const stage = page.locator('.prod-stage');
  const box = await stage.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(340);
  expect(box!.x).toBeLessThan(25);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
