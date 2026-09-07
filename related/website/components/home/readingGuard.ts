import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Finish the last composition before consuming the remaining wheel momentum. */
export function guardReadingStop(root: HTMLElement, scroll: ScrollTrigger, point: () => number) {
  let motion: gsap.core.Tween | undefined;
  let cooling = false;
  let lastWheel = 0;
  const cancel = () => { motion?.kill(); motion = undefined; cooling = false; };
  const wheel = (event: WheelEvent) => {
    if (root.dataset.homeState !== "open" || event.defaultPrevented || event.ctrlKey ||
      Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    let element = event.target instanceof Element ? event.target : null;
    if (element?.closest('input, textarea, select, [contenteditable], [role="dialog"]')) return;
    while (element && element !== document.body) {
      if (/(auto|scroll)/.test(getComputedStyle(element).overflowY) && element.scrollHeight > element.clientHeight + 2) return;
      element = element.parentElement;
    }
    const quiet = performance.now() - lastWheel > 220;
    lastWheel = performance.now();
    if (motion || (cooling && !quiet)) { event.preventDefault(); return; }
    cooling = false;
    const destination = point();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (delta <= 0 || scrollY < scroll.start || scrollY >= destination - 2 || scrollY + delta < destination) return;
    event.preventDefault();
    const snapping = scroll.getTween(true);
    if (snapping) snapping.kill();
    const state = { y: scrollY };
    motion = gsap.to(state, {
      y: destination, duration: 0.65, ease: "sine.inOut",
      onUpdate: () => { window.scrollTo({ top: state.y, behavior: "instant" }); ScrollTrigger.update(); },
      onComplete: () => { motion = undefined; cooling = true; },
    });
  };
  const key = (event: KeyboardEvent) => {
    if (["Home", "End", "PageDown", "PageUp", "ArrowDown", "ArrowUp", " ", "Escape"].includes(event.key)) cancel();
  };
  window.addEventListener("wheel", wheel, { passive: false });
  window.addEventListener("keydown", key);
  window.addEventListener("pointerdown", cancel, { passive: true });
  ScrollTrigger.addEventListener("refreshInit", cancel);
  return () => {
    cancel();
    window.removeEventListener("wheel", wheel);
    window.removeEventListener("keydown", key);
    window.removeEventListener("pointerdown", cancel);
    ScrollTrigger.removeEventListener("refreshInit", cancel);
  };
}
