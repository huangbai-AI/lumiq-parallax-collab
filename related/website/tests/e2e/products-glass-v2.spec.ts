import {expect, test} from '@playwright/test';

test('thick glass bevel preserves frost and leaves card controls accessible', async ({page}) => {
  await page.goto('/en/products#lineup');
  const card = page.locator('.prod-slide[data-slot="center"]');
  const material = await card.evaluate(element => {
    const face = getComputedStyle(element);
    const bevel = getComputedStyle(element, '::after');
    return {blur: face.backdropFilter, bevel: bevel.content, events: bevel.pointerEvents, inset: bevel.boxShadow};
  });
  expect(material.bevel).not.toBe('none');
  expect(material.events).toBe('none');
  expect(material.inset).toContain('inset');
  expect(material.blur).toContain('blur(30px)');
  const before = await card.getAttribute('data-product-id');
  await page.locator('.prod-slide[data-slot="next"]').click();
  await expect(card).not.toHaveAttribute('data-product-id', before!);
});
