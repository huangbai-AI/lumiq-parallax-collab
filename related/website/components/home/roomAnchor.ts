import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { readingStop } from "./readingStops";
import { guardReadingStop } from "./readingGuard";

export function mountRoomAnchor(root: HTMLElement) {
  const room = root.querySelector<HTMLElement>(".lh-room-layout");
  if (!room) return () => {};
  const mm = gsap.matchMedia();
  mm.add("(min-width: 1101px) and (min-height: 720px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
    const navHeight = () => document.querySelector('.site-nav')?.getBoundingClientRect().height ?? 86;
    const measure = () => room.style.setProperty('--room-height', `${innerHeight - navHeight()}px`);
    room.dataset.reading = 'true';
    measure();
    ScrollTrigger.addEventListener('refreshInit', measure);
    const scroll = ScrollTrigger.create({
      id: "home-room-anchor", trigger: room, pin: room,
      start: () => `top ${navHeight()}`,
      end: () => `+=${innerHeight * 0.65}`,
      anticipatePin: 1, invalidateOnRefresh: true,
    });
    // Start settling while the room enters, so a short gesture does not leave
    // its title and composition stranded below the viewport.
    ScrollTrigger.create({
      id: "home-room-landing",
      start: () => scroll.start - innerHeight * 0.65,
      end: () => scroll.end,
      snap: {
        snapTo: (value: number, self?: ScrollTrigger) => readingStop(value, [0.61], self?.direction ?? 1, 0.65),
        inertia: false, delay: 0.2, duration: { min: 0.4, max: 0.9 }, ease: "sine.inOut",
      },
    });
    const releaseGuard = guardReadingStop(root, scroll, () => scroll.start + (scroll.end - scroll.start) * 0.22);
    return () => {
      releaseGuard();
      ScrollTrigger.removeEventListener('refreshInit', measure);
      delete room.dataset.reading;
      room.style.removeProperty('--room-height');
    };
  });
  return () => mm.revert();
}

export function mountJoinAnchor(root: HTMLElement) {
  const join = root.querySelector<HTMLElement>("#join");
  if (!join) return () => {};
  const mm = gsap.matchMedia();
  mm.add("(min-width: 1101px) and (min-height: 720px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
    ScrollTrigger.create({
      id: "home-join-anchor", trigger: join,
      start: "top bottom", end: () => `top ${document.querySelector('.site-nav')?.getBoundingClientRect().height ?? 86}`,
      snap: {
        snapTo: (value: number, self?: ScrollTrigger) => document.activeElement?.closest('form') || self?.direction === -1
          ? value : value > 0.55 ? 1 : value,
        inertia: false, delay: 0.22, duration: { min: 0.35, max: 0.75 }, ease: "sine.inOut",
      },
    });
  });
  return () => mm.revert();
}
