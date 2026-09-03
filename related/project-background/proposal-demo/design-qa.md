# Design QA — LUMIQ local source recreation

## Comparison targets

- Source visual truth:
  - `/Users/a1/Documents/LumiQ/references/source-captures/original-products-top-desktop.png`
  - `/Users/a1/Documents/LumiQ/references/source-captures/original-story-top-desktop.png`
  - `/Users/a1/Documents/LumiQ/references/source-captures/original-faq-top-mobile.png`
- Rendered implementation:
  - `/Users/a1/Documents/LumiQ/proposal-assets/recordings/source-clone/local-products-1265x712.png`
  - `/Users/a1/Documents/LumiQ/proposal-assets/recordings/source-clone/local-story-1265x712.png`
  - `/Users/a1/Documents/LumiQ/proposal-assets/recordings/source-clone/local-faq-mobile.png`
- Combined comparison evidence:
  - `/Users/a1/Documents/LumiQ/proposal-assets/recordings/source-clone/compare-products-source-vs-local.png`
  - `/Users/a1/Documents/LumiQ/proposal-assets/recordings/source-clone/compare-story-source-vs-local.png`
  - `/Users/a1/Documents/LumiQ/proposal-assets/recordings/source-clone/compare-faq-mobile-source-vs-local.png`

## Viewports and normalization

- Desktop source captures: 1265 × 712 px.
- Desktop implementation captures: 1250 × 704 px from a requested 1265 × 712 CSS viewport in the in-app browser, device density 1. The implementation images were scaled to 1265 × 712 only for the combined visual comparison.
- Mobile source and implementation captures: 375 × 812 px from a requested 390 × 844 CSS viewport, device density 1. No density or scale normalization was required.
- States compared: Products first screen, Brand Story first screen, FAQ first/open item on mobile.

## Full-view comparison

- Information architecture and composition remain aligned with the source: fixed brand header, editorial serif headline, gold accent, descriptive copy, paired media region, and the same top-level navigation hierarchy.
- The source’s dated product renders were deliberately replaced with the already generated LUMIQ image-to-image assets. Crop, subject scale, hero balance and text/media proportions remain comparable.
- Brand Story and product naming use the latest project document rather than the older Kobi/Pal source labels. This is an intentional content correction, not visual drift.
- The inner-page header uses a lighter floating surface and a local prelaunch action. This is an intentional continuation of the approved homepage direction while preserving the source page rhythm.

## Focused comparison

- Mobile FAQ comparison confirms that the key responsive surfaces match: compact logo/menu header, stacked editorial title, support copy, pill search field, count indicator and accordion rows.
- The local title uses the current gold italic treatment and a slightly stronger type hierarchy; the layout remains within the same reading order and density.

## Required fidelity surfaces

- Fonts and typography: Georgia/Arial are used as self-contained fallbacks in place of the source’s Playfair Display/Inter web fonts. Display/body hierarchy, italic accent, line height and wrapping are stable on desktop and mobile. This is acceptable for the local source handoff; confirmed brand fonts can replace the fallbacks later.
- Spacing and layout rhythm: desktop two-column heroes, generous white space, fixed header clearance, section gaps, mobile stacks, card radii and dividers were checked. No overlap, clipping or persistent-control obstruction was found.
- Colors and visual tokens: paper, ink, gold, coral and violet remain consistent across pages and states. Text/background contrast is readable in both homepage directions and all inner pages.
- Image quality and asset fidelity: all visible hero/product media are real generated image or video files. No hotlinked old-site image, placeholder, CSS illustration or handmade SVG substitutes are used. The source images remain only under `references/` as geometry evidence.
- Copy and content: navigation and page structure follow the source; Brand Story, Tablet, Ola/Ola Go and Print copy follow the newer brand document. Safety/AI language avoids presenting companionship or care as a replacement for people or professional support.
- Icons: controls use one consistent icon library; menu, close, arrows, search, plus/minus, check and mail marks align and change state correctly.
- Responsiveness and accessibility: mobile navigation, tap targets, labels, alt text, focus indicators, reduced-motion handling, accordion semantics and form labels are present. No horizontal overflow was visible at 390 × 844.

## Interaction checks

- Local navigation and browser history routes.
- Mobile menu open, close and page navigation.
- Homepage direction switch.
- Cursor mask reveal.
- Scroll-bound video progress and chapter changes.
- Product tab selection and local detail route.
- Yearly/monthly price toggle.
- FAQ search, result count and accordion state.
- Local prelaunch form and success state.
- Console warnings/errors: none on the local app.

## Findings

- No actionable P0, P1 or P2 issues remain.
- P3 follow-up: replace the self-contained serif/sans fallbacks after the brand team confirms final licensed typefaces.
- P3 follow-up: create dedicated image-to-image product stills for Tablet and Print so the product grid does not reuse frames from the homepage film.

## Comparison history

- Initial review found the prototype’s navigation pointed back to the hosted source site. Fix: all navigation, CTAs, product details and prelaunch flows were rebuilt as local routes, then rechecked in the browser.
- Initial mobile review found the old site and local screenshots were not captured at matching sizes. Fix: both FAQ states were recaptured in the selected browser at the same 390 × 844 CSS viewport and compared together.
- Post-fix evidence is recorded in the three combined comparison images above. No P0/P1/P2 differences remain.

final result: passed
