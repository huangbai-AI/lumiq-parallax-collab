import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Native scroll space holds the composition without intercepting or reversing wheel input. */
export function mountContentStops(root: HTMLElement) {
  const mm = gsap.matchMedia();
  mm.add("(min-width: 1101px) and (min-height: 640px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
    for (const selector of [".lh-products-stage", ".lh-films"]) {
      const stage = root.querySelector<HTMLElement>(selector);
      if (!stage) continue;
      ScrollTrigger.create({
        id: selector === ".lh-products-stage" ? "home-products-hold" : "home-films-hold",
        trigger: stage, pin: stage,
        start: selector === ".lh-films" ? "top 86px" : "top top", end: "+=240",
        anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 1,
      });
    }
  });
  return () => mm.revert();
}
