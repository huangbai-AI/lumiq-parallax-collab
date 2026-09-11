import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Native scroll space holds the composition without intercepting or reversing wheel input. */
export function mountContentStops(root: HTMLElement) {
  const mm = gsap.matchMedia();
  mm.add("(min-width: 1101px) and (min-height: 640px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
    const stage = root.querySelector<HTMLElement>(".lh-products-stage");
    if (!stage) return;
    ScrollTrigger.create({
      id: "home-products-hold", trigger: stage, pin: stage,
      start: "top top", end: "+=240",
      anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 1,
    });
  });
  return () => mm.revert();
}
