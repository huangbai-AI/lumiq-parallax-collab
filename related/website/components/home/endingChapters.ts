import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const endingMotionQuery =
  "(min-width: 1101px) and (min-height: 720px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** Native sticky stages: scrolling stays native, and CSS also works without JS. */
export function mountEndingChapters(root: HTMLElement) {
  const trust = root.querySelector<HTMLElement>(".lh-trust-scroll");
  const room = trust?.querySelector<HTMLElement>(".lh-trust-room");
  const family = root.querySelector<HTMLElement>("#family");
  const track = family?.querySelector<HTMLElement>(".lh-family-scroll");
  const stage = track?.querySelector<HTMLElement>(".lh-family-anchor");
  if (!trust || !room || !family || !track || !stage) return () => {};
  const measure = () => {
    const height = document.querySelector(".site-nav")?.getBoundingClientRect().height ?? 86;
    root.style.setProperty("--lh-ending-nav", `${height}px`);
  };
  measure();
  ScrollTrigger.addEventListener("refreshInit", measure);
  const mm = gsap.matchMedia();
  mm.add(endingMotionQuery, () => {
    trust.dataset.anchored = "true";
    track.dataset.anchored = "true";
    const navHeight = () => parseFloat(root.style.getPropertyValue("--lh-ending-nav"));
    gsap.fromTo(room.querySelector(".lh-safety-photo"), { scale: 1.015 }, {
      scale: 1,
      ease: "none",
      scrollTrigger: {
        id: "home-trust-anchor",
        trigger: trust,
        start: () => `top ${navHeight()}`,
        end: () => `+=${trust.offsetHeight - room.offsetHeight}`,
        scrub: 0.65,
        invalidateOnRefresh: true,
      },
    });
    const buttons = Array.from(family.querySelectorAll<HTMLElement>('[role="tab"]'));
    let active = -1;
    const render = (progress: number) => {
      const next = Math.min(2, Math.floor(progress * 3));
      buttons.forEach((button, index) => button.style.setProperty(
        "--chapter-progress", String(gsap.utils.clamp(0, 1, progress * 3 - index)),
      ));
      if (next === active) return;
      active = next;
      family.dataset.chapter = String(next);
      family.dispatchEvent(new CustomEvent("lumiq:chapter-change", { detail: next }));
    };
    const scroll = ScrollTrigger.create({
      id: "home-family-chapters",
      trigger: track,
      start: () => `top ${navHeight()}`,
      end: () => `+=${track.offsetHeight - stage.offsetHeight}`,
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => render(self.progress),
    });
    const select = (event: Event) => {
      const index = (event as CustomEvent<number>).detail;
      if (!Number.isInteger(index) || index < 0 || index > 2) return;
      // The stage stays still; only its chapter changes, including keyboard selection.
      window.scrollTo({
        top: scroll.start + ((index + 0.5) / 3) * (scroll.end - scroll.start),
        behavior: "instant",
      });
      ScrollTrigger.update();
      render(scroll.progress);
    };
    family.addEventListener("lumiq:chapter-select", select);
    render(scroll.progress);
    return () => {
      family.removeEventListener("lumiq:chapter-select", select);
      delete trust.dataset.anchored;
      delete track.dataset.anchored;
      delete family.dataset.chapter;
      buttons.forEach((button) => button.style.removeProperty("--chapter-progress"));
    };
  });
  return () => {
    mm.revert();
    ScrollTrigger.removeEventListener("refreshInit", measure);
    root.style.removeProperty("--lh-ending-nav");
  };
}
