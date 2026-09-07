import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** A small vertical gesture commits to one complete opening transition. */
export function mountOpeningAnchors(root: HTMLElement, scroll: ScrollTrigger, anchor: number, onIntent: () => void) {
  let tween: gsap.core.Tween | undefined;
  let lastWheel = 0;
  let accumulated = 0;
  let cooling = false;
  const anchorY = () => scroll.start + (scroll.end - scroll.start) * anchor;
  const eligible = (target: EventTarget | null) => {
    if (root.dataset.homeState !== "open") return false;
    // Leave dialogs, controls and nested scroll areas in charge of their input.
    let element = target instanceof Element ? target : null;
    if (element?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return false;
    while (element && element !== document.body && element !== document.documentElement) {
      const style = getComputedStyle(element);
      if (/(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 2) return false;
      element = element.parentElement;
    }
    return true;
  };
  const destination = (direction: number) => {
    const y = window.scrollY;
    if (y < scroll.start - 2 || y > anchorY() + 8) return undefined;
    if (direction > 0 && y < anchorY() - 8) return anchor;
    if (direction < 0 && y > scroll.start + 8) return 0;
    return undefined;
  };
  const navigate = (to: number) => {
    onIntent();
    // ScrollTrigger also returns 0 after a completed snap (despite its types).
    const snapping = scroll.getTween(true);
    if (snapping) snapping.kill();
    const from = window.scrollY;
    const motion = { progress: 0 };
    root.dataset.openingTravel = "true";
    tween = gsap.to(motion, {
      progress: 1,
      duration: 2.8,
      ease: "sine.inOut",
      onUpdate: () => {
        const end = to ? anchorY() : scroll.start;
        window.scrollTo({ top: from + (end - from) * motion.progress, behavior: "instant" });
        ScrollTrigger.update();
        // The gesture already has easing; avoid adding a second catch-up delay.
        const scrub = scroll.getTween();
        if (scrub) scrub.progress(1);
      },
      onComplete: () => {
        tween = undefined;
        cooling = true;
        delete root.dataset.openingTravel;
      },
    });
  };
  const wheel = (event: WheelEvent) => {
    if (!tween && !cooling && (scrollY < scroll.start - 2 || scrollY > anchorY() + 8)) return;
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !eligible(event.target)) return;
    const now = performance.now();
    const quiet = now - lastWheel > 200;
    lastWheel = now;
    if (tween || (cooling && !quiet)) { event.preventDefault(); return; }
    cooling = false;
    const to = destination(event.deltaY);
    if (to === undefined || event.deltaY === 0) return;
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (quiet || Math.sign(accumulated) !== Math.sign(delta)) accumulated = 0;
    accumulated += delta;
    if (Math.abs(accumulated) < 6) return;
    accumulated = 0;
    navigate(to);
  };
  const key = (event: KeyboardEvent) => {
    if (!eligible(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.target instanceof Element && event.target.closest('a, button, [role="button"]')) return;
    if (event.key === "Home" || event.key === "End") {
      tween?.kill();
      tween = undefined;
      cooling = false;
      delete root.dataset.openingTravel;
      return; // Preserve the browser's explicit jump-to-start/end command.
    }
    const direction = ["ArrowDown", "PageDown"].includes(event.key) || (event.key === " " && !event.shiftKey) ? 1
      : ["ArrowUp", "PageUp"].includes(event.key) || (event.key === " " && event.shiftKey) ? -1 : 0;
    if (!direction) return;
    if (tween) { event.preventDefault(); return; }
    const to = destination(direction);
    if (to === undefined) return;
    event.preventDefault();
    if (event.repeat) return;
    navigate(to);
  };
  window.addEventListener("wheel", wheel, { passive: false });
  window.addEventListener("keydown", key);
  return () => {
    tween?.kill();
    window.removeEventListener("wheel", wheel);
    window.removeEventListener("keydown", key);
    delete root.dataset.openingTravel;
  };
}
