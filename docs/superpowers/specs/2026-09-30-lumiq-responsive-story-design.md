# LumiQ responsive layout and story transition design

## Intent and scope

The Taiwan LumiQ site must remain usable and visually coherent on phones, medium-width windows, standard desktop displays, and wide monitors. The shared navigation must remain discoverable on every page, without covering primary page content. The Brand Story origin section also needs its two English paragraphs in left and right columns on sufficiently wide screens, and the hairline between that section and the next one must disappear. These changes are local only; publication requires a separate user request.

This work covers the existing home, products listing and product-detail pages, Brand Story, Plans, Media & Review, and FAQ routes in English, Traditional Chinese, and Japanese. It preserves the current content, glass visual language, product imagery, and existing carousel behavior. It does not redesign page sections or introduce a new animation system.

## Approach

Use the existing shared `SiteHeader` and page styles rather than create separate mobile pages. Align the CSS navigation breakpoint and the component's `matchMedia` close behavior. Let the full six-link navigation appear at widths where it fits; use a compact glass capsule with a visibly labeled menu trigger below that threshold. The opened menu exposes the same six destinations and language choices as the desktop navigation. Preserve keyboard focus, Escape-to-close, and reduced-motion behavior. Do not animate a layout breakpoint itself; menu feedback should remain short and interruptible.

Use content-aware CSS grids, fluid sizing, and readable maximum widths for page sections. At wide widths, retain the full-bleed backgrounds while keeping text and controls at readable line lengths. At phone widths, stack content that would otherwise collide; keep controls large enough to use by touch. Do not hide essential content merely to make horizontal-overflow checks pass.

For Brand Story, keep `01 BRAND STORY` and its adjacent rule as the heading row. Below it, render the two existing paragraphs as two balanced columns at widths of at least 900px, with a deliberate gutter. At narrower widths, use one column in source order. Remove the top and bottom section-border rule that currently creates a visible seam at the origin-to-principles transition; keep the single continuous page background and the heading-row rule.

## Verification and acceptance

- Check representative viewport widths of 320, 375, 768, 1024, 1280, 1440, 1920, and 2560px, including at least one short viewport height.
- On every covered route and locale, navigation remains reachable, the page has no unintended horizontal overflow, and essential text and controls are not clipped or covered by the fixed header.
- On phones, the menu button is evident and opens all destinations and language choices. At the desktop breakpoint, the full navigation fits inside the glass capsule. Resizing across the breakpoint never leaves the menu open while its trigger is hidden or leaves page scrolling locked.
- Brand Story shows two paragraphs side by side at desktop widths and in one column on phones. The boundary above the principles section has no hairline, while the heading's rule remains.
- Compare before/after screenshots at representative widths. Add the change description and screenshots to the existing local Taiwan LumiQ change-log workbook. If Feishu access remains unavailable, report that explicitly rather than claim remote synchronization.
- Run the relevant automated tests, typecheck, and browser checks before claiming completion. Keep the local preview available and provide its exact clickable URL. Do not deploy or push this change unless asked.

## Failure modes to guard against

- English, Traditional Chinese, and Japanese labels have different widths; the compact navigation must not overlap controls.
- A mobile menu opened before resizing must close when desktop navigation appears, restoring body scrolling.
- Decorative carousels may intentionally extend sideways, but their overflow must not create a page-level horizontal scrollbar or obscure their controls.
- The fixed header may look correct at 900px height yet cover content on short screens; verify at reduced height.
- The Brand Story seam may come from a section border rather than the title divider; remove only the unwanted separator.
