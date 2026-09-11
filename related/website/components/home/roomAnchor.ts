import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
    ScrollTrigger.create({
      id: "home-room-anchor", trigger: room, pin: room,
      start: () => `top ${navHeight()}`,
      end: () => `+=${innerHeight * 0.65}`,
      anticipatePin: 1, invalidateOnRefresh: true,
    });
    return () => {
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
      id: "home-join-anchor", trigger: join, pin: join,
      start: () => `top ${document.querySelector('.site-nav')?.getBoundingClientRect().height ?? 86}`, end: "+=240",
    });
    return () => {};
  });
  return () => mm.revert();
}
