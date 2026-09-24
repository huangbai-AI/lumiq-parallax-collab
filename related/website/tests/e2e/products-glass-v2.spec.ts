import {expect, test} from '@playwright/test';

test('whole 3D glass surface replaces decorative rings and leaves controls accessible', async ({page}) => {
  await page.goto('/en/products#lineup');
  const card = page.locator('.prod-slide[data-slot="center"]');
  await expect(card.locator('canvas')).toBeVisible();
  await expect(page.locator('.prod-carousel-glow')).toHaveCount(0);
  expect(await card.evaluate(element => getComputedStyle(element, '::after').content)).toBe('none');
  const before = await card.getAttribute('data-product-id');
  await page.locator('.prod-slide[data-slot="next"]').click();
  await expect(card).not.toHaveAttribute('data-product-id', before!);
});
