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
    expect(totalOpacity, `${slot} card should leave room for the moving outer glow`).toBeLessThan(slot === 'center' ? 0.5 : 0.3);
    expect(totalOpacity, `${slot} card should still have visible color`).toBeGreaterThan(0.18);
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
    Math.max(r, g, b) - Math.min(r, g, b) > 35 && alpha >= 0.04,
  );
  expect(visibleColoredGlow.length).toBeGreaterThanOrEqual(3);
  expect(visibleColoredGlow.reduce((sum, [, , , alpha]) => sum + alpha, 0)).toBeLessThan(0.3);
});

test('closed edge glow has no traveling dash ends while its color and brightness move in 20 seconds', async ({page}, info) => {
  test.skip(info.project.name !== 'desktop', 'desktop carousel glow');
  await page.setViewportSize({width: 1440, height: 900});
  await page.goto('/en/products#lineup');

  const halo = page.locator('.prod-carousel-glow');
  await expect(halo).toHaveCount(1);
  const cardBox = await page.locator('.prod-slide[data-slot="center"]').boundingBox();
  const trackBox = await halo.boundingBox();
  expect(cardBox).not.toBeNull();
  expect(trackBox).not.toBeNull();
  expect(Math.abs(trackBox!.x - cardBox!.x)).toBeLessThan(2);
  expect(Math.abs(trackBox!.y - cardBox!.y)).toBeLessThan(2);
  expect(Math.abs(trackBox!.width - cardBox!.width)).toBeLessThan(2);
  expect(Math.abs(trackBox!.height - cardBox!.height)).toBeLessThan(2);

  await expect(halo.locator('[stroke-dasharray]')).toHaveCount(0);
  const bands = halo.locator('.prod-glow-band');
  const moving = halo.locator('.prod-glow-sweep');
  await expect(bands).toHaveCount(1);
  await expect(moving).toHaveCount(1);
  const before = await moving.evaluateAll((elements) => elements.map((element) => {
    const style = getComputedStyle(element);
    const mask = getComputedStyle(element.parentElement!);
    const diffusion = getComputedStyle(element.parentElement!.parentElement!);
    return {duration: parseFloat(style.animationDuration), name: style.animationName, transform: style.transform, background: style.backgroundImage, mask: mask.maskImage, filter: diffusion.filter, spread: parseFloat(diffusion.getPropertyValue('--spread'))};
  }));
  for (const layer of before) {
    expect(layer.duration).toBe(20);
    expect(layer.name).not.toBe('none');
    expect(layer.filter).toContain('blur(');
    expect(parseFloat(layer.filter.match(/blur\((\d+(?:\.\d+)?)px\)/)?.[1] ?? '0')).toBeGreaterThanOrEqual(layer.spread);
    expect(layer.mask).not.toBe('none');
    expect(layer.background).toContain('conic-gradient');
    expect(layer.background).not.toContain('transparent');
    const start = layer.background.match(/(rgba?\([^)]+\)) 0deg/)?.[1];
    const end = layer.background.match(/(rgba?\([^)]+\)) 360deg/)?.[1];
    expect(start).toBeTruthy();
    expect(end).toBe(start);
  }

  await page.waitForTimeout(250);
  const laterTransform = await moving.first().evaluate((element) => getComputedStyle(element).transform);
  expect(laterTransform).not.toBe(before[0].transform);

  await page.emulateMedia({reducedMotion: 'reduce'});
  const reduced = await moving.evaluateAll((elements) => elements.map((element) => getComputedStyle(element).animationName));
  expect(reduced).toEqual(['none']);
});

test('edge glow stays narrow without stacked colored outer shadows', async ({page}, info) => {
  test.skip(info.project.name !== 'desktop', 'desktop carousel glow');
  await page.setViewportSize({width: 1440, height: 900});
  await page.goto('/en/products#lineup');

  const glow = await page.locator('.prod-glow-band').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      spread: parseFloat(style.getPropertyValue('--spread')),
      blur: parseFloat(style.filter.match(/blur\((\d+(?:\.\d+)?)px\)/)?.[1] ?? '0'),
    };
  });
  expect(glow.spread).toBeGreaterThanOrEqual(9);
  expect(glow.spread).toBeLessThanOrEqual(11);
  expect(glow.blur).toBeGreaterThanOrEqual(11);
  expect(glow.blur).toBeLessThanOrEqual(13);

  const outerColoredShadows = await page.locator('.prod-slide[data-slot="center"]').evaluate((element) =>
    getComputedStyle(element).boxShadow.split(/\),\s*/).filter((shadow) => {
      if (shadow.includes('inset')) return false;
      const colors = shadow.match(/rgba?\((\d+), (\d+), (\d+)/)?.slice(1).map(Number);
      return colors ? Math.max(...colors) - Math.min(...colors) > 40 : false;
    }),
  );
  expect(outerColoredShadows).toEqual([]);
});

test('active glass card has no fixed bright rim interrupting the soft halo', async ({page}, info) => {
  test.skip(info.project.name !== 'desktop', 'desktop carousel glow');
  await page.setViewportSize({width: 1440, height: 900});
  await page.goto('/en/products#lineup');

  const card = await page.locator('.prod-slide[data-slot="center"]').evaluate((element) => {
    const style = getComputedStyle(element);
    return {border: style.borderTopColor, shadow: style.boxShadow};
  });
  expect(card.border).toBe('rgba(0, 0, 0, 0)');
  expect(card.shadow).not.toContain('inset 0px 1px 0px');
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
  const travelSamples = incoming!.evaluate((card) => new Promise<number[]>((resolve) => {
    const positions: number[] = [];
    const started = performance.now();
    const capture = () => {
      positions.push(card.getBoundingClientRect().x);
      if (performance.now() - started < 1200) requestAnimationFrame(capture);
      else resolve(positions);
    };
    requestAnimationFrame(capture);
  }));
  await page.mouse.wheel(0, 120);
  await expect.poll(() => incoming!.evaluate((card) => card.classList.contains('prod-stage'))).toBe(true);
  const positions = await travelSamples;
  const after = await incoming!.boundingBox();
  expect(after).not.toBeNull();
  expect(positions.some((x) => x < before!.x - 20 && x > after!.x + 20), 'incoming card should occupy positions between side and center').toBe(true);
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
