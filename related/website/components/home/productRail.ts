import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  const counter = section.querySelector<HTMLElement>(
    "[data-products-current]",
  )!;
  let pin: ScrollTrigger | undefined;
  let tween: gsap.core.Tween | undefined;
  let travel = 0;
  let stride = 1;
  const measure = () => {
    travel = Math.max(0, track.scrollWidth - viewport.clientWidth);
    stride = Math.max(1, slots[1].offsetLeft - slots[0].offsetLeft);
  };
  measure();
  const distance = () => travel;
  const step = () => stride;
  const position = () =>
    pin ? pin.progress * distance() : viewport.scrollLeft;
  const update = () => {
    const offset = position();
    const max = distance();
    const first = Math.min(slots.length, Math.floor((offset + 2) / step()) + 1);
    counter.textContent = String(first).padStart(2, "0");
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
          (distance() ? target / distance() : 0) * (pin.end - pin.start),
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
      tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          id: "home-products-horizontal",
          trigger: stage,
          pin: stage,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.55,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          refreshPriority: 1,
          onUpdate: update,
          onRefresh: update,
        },
      });
      pin = tween.scrollTrigger;
      update();
      return () => {
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
