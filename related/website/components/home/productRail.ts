import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { readingStop } from "./readingStops";
import { guardReadingStop } from "./readingGuard";

/** Progressive enhancement: the server-rendered rail works without motion or JS. */
export function mountProductRail(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>(".lh-products");
  const stage = section?.querySelector<HTMLElement>(".lh-products-stage");
  const viewport = section?.querySelector<HTMLElement>(".lh-products-viewport");
  const track = section?.querySelector<HTMLElement>(".lh-products-track");
  if (!section || !stage || !viewport || !track) return () => {};
  const slots = Array.from(
    track.querySelectorAll<HTMLElement>(".lh-product-slot"),
  );
  const previous = section.querySelector<HTMLButtonElement>(
    "[data-products-previous]",
  )!;
  const next = section.querySelector<HTMLButtonElement>(
    "[data-products-next]",
  )!;
  const meter = section.querySelector<HTMLElement>(
    ".lh-products-progress span",
  )!;
  let pin: ScrollTrigger | undefined;
  let tween: gsap.core.Timeline | undefined;
  let hold = 0;
  let travel = 0;
  let stride = 1;
  const measure = () => {
    travel = Math.max(0, track.scrollWidth - viewport.clientWidth);
    stride = Math.max(1, slots[1].offsetLeft - slots[0].offsetLeft);
    hold = Math.max(480, window.innerHeight * 0.8);
  };
  measure();
  const distance = () => travel;
  const step = () => stride;
  const position = () =>
    pin ? Math.min(distance(), pin.progress * (distance() + hold)) : viewport.scrollLeft;
  const update = () => {
    const offset = position();
    const max = distance();
    meter.style.transform = `scaleX(${max ? offset / max : 1})`;
    previous.disabled = offset < 2;
    next.disabled = offset >= max - 2;
  };
  const resize = new ResizeObserver(() => { measure(); update(); });
  resize.observe(viewport);
  resize.observe(track);
  ScrollTrigger.addEventListener("refreshInit", measure);
  const go = (offset: number, immediate = false) => {
    const target = gsap.utils.clamp(0, distance(), offset);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (pin) {
      window.scrollTo({
        top:
          pin.start +
          target + (target >= distance() - 2 ? hold * 0.2 : 0),
        behavior: immediate ? "instant" : "smooth",
      });
      if (immediate) {
        ScrollTrigger.update();
        tween?.progress(pin.progress);
      }
    } else {
      viewport.scrollTo({
        left: target,
        behavior: immediate || reduced ? "instant" : "smooth",
      });
    }
  };
  const back = () => go(position() - step());
  const forward = () => go(position() + step());
  const focus = (event: FocusEvent) => {
    const link = (event.target as HTMLElement).closest<HTMLElement>(
      ".lh-product",
    );
    if (!link || !pin) return;
    // Browser focus scrolling must not compete with the transform-driven rail.
    viewport.scrollLeft = 0;
    const box = link.getBoundingClientRect();
    const bounds = viewport.getBoundingClientRect();
    if (box.left < bounds.left - 2 || box.right > bounds.right + 2) {
      go(link.parentElement!.offsetLeft, true);
    }
  };
  previous.addEventListener("click", back);
  next.addEventListener("click", forward);
  viewport.addEventListener("scroll", update, { passive: true });
  track.addEventListener("focusin", focus);
  section.dataset.enhanced = "true";
  const mm = gsap.matchMedia();
  mm.add(
    "(min-width: 1101px) and (min-height: 720px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    () => {
      viewport.scrollLeft = 0;
      section.dataset.pinned = "true";
      tween = gsap.timeline({
        scrollTrigger: {
          id: "home-products-horizontal",
          trigger: stage,
          pin: stage,
          start: "top top",
          end: () => `+=${distance() + hold}`,
          scrub: 0.55,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          refreshPriority: 1,
          onUpdate: update,
          onRefresh: update,
          snap: {
            snapTo: (value: number, self?: ScrollTrigger) => {
              const total = distance() + hold;
              const stops = [...new Set(slots.map((slot) => Math.min(distance(), slot.offsetLeft)))];
              // The final product has its own reading point inside the exit hold.
              stops[stops.length - 1] = distance() + hold * 0.2;
              return readingStop(value, stops.map((offset) => offset / total), self?.direction ?? 1, (step() + hold * 0.2) / total);
            },
            inertia: false, delay: 0.18, duration: { min: 0.35, max: 0.8 }, ease: "sine.inOut",
          },
        },
      }).to(track, { x: () => -distance(), duration: distance(), ease: "none" })
        .to({}, { duration: hold });
      // Refresh both durations when width changes, preserving the same pixel mapping.
      const resizeTimeline = () => {
        const parts = tween?.getChildren();
        parts?.[0]?.duration(distance());
        if (parts?.[1]) { parts[1].startTime(distance()); parts[1].duration(hold); }
      };
      ScrollTrigger.addEventListener("refreshInit", resizeTimeline);
      pin = tween.scrollTrigger;
      const releaseGuard = pin ? guardReadingStop(root, pin, () => pin!.start + distance() + hold * 0.2) : () => {};
      update();
      return () => {
        releaseGuard();
        ScrollTrigger.removeEventListener("refreshInit", resizeTimeline);
        pin = undefined;
        tween = undefined;
        delete section.dataset.pinned;
        viewport.scrollLeft = 0;
        update();
      };
    },
  );
  update();
  return () => {
    mm.revert();
    resize.disconnect();
    ScrollTrigger.removeEventListener("refreshInit", measure);
    delete section.dataset.enhanced;
    previous.removeEventListener("click", back);
    next.removeEventListener("click", forward);
    viewport.removeEventListener("scroll", update);
    track.removeEventListener("focusin", focus);
  };
}
